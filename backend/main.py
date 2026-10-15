import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import get_settings
from database.supabase_client import get_supabase
from routers import chat, routes, reports, users

settings = get_settings()

# ─── Socket.IO ──────────────────────────────────────────────
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=settings.cors_origins.split(","),
)

# Almacén en memoria de ubicaciones de choferes activos
driver_locations: dict = {}


@sio.event
async def connect(sid, environ):
    print(f"[Socket.IO] Cliente conectado: {sid}")


@sio.event
async def disconnect(sid):
    print(f"[Socket.IO] Cliente desconectado: {sid}")
    # Limpiar ubicación del chofer si se desconecta
    driver_locations.pop(sid, None)


@sio.event
async def driver_location(sid, data):
    """
    Chofer emite su ubicación GPS.
    data: { driver_id, lat, lng, route_id, status }
    """
    driver_locations[data.get("driver_id", sid)] = data
    # Broadcast a todos los pasajeros conectados
    await sio.emit("driver_update", data, skip_sid=sid)


@sio.event
async def join_route(sid, data):
    """Pasajero se une a la sala de una ruta para recibir actualizaciones."""
    room = f"route_{data.get('route_id')}"
    await sio.enter_room(sid, room)
    await sio.emit("joined", {"room": room}, to=sid)


@sio.event
async def new_report(sid, data):
    """Pasajero emite un nuevo reporte de incidente."""
    await sio.emit("report_alert", data)  # Broadcast a admin


ADMIN_EMAIL    = "admin@wayra.bo"
ADMIN_PASSWORD = "WayraAdmin2026!"


def _ensure_admin_exists() -> None:
    """Crea el primer admin automáticamente si no existe ninguno."""
    try:
        db = get_supabase()
        existing = db.table("profiles").select("id").eq("role", "admin").limit(1).execute()
        if existing.data:
            return
        db.auth.admin.create_user({
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD,
            "email_confirm": True,
            "user_metadata": {"full_name": "Administrador WAYRA", "role": "admin"},
        })
        print("=" * 50)
        print("[WAYRA] Admin creado automaticamente")
        print(f"[WAYRA] Email:      {ADMIN_EMAIL}")
        print(f"[WAYRA] Contrasena: {ADMIN_PASSWORD}")
        print("=" * 50)
    except Exception as e:
        print(f"[WAYRA] No se pudo crear admin: {e}")


# ─── FastAPI App ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("WAYRA Backend iniciando...")
    _ensure_admin_exists()
    yield
    print("WAYRA Backend detenido")


app = FastAPI(
    title="WAYRA API",
    description="Backend de movilidad urbana para Cochabamba, Bolivia",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(chat.router, prefix="/api/chat")
app.include_router(routes.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(users.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "app": "WAYRA",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/api/health")
async def health():
    return {"status": "ok", "message": "WAYRA está funcionando 🌬️"}


@app.get("/api/drivers/active")
async def get_active_drivers():
    """Retorna las ubicaciones de choferes activos en memoria."""
    return {"drivers": list(driver_locations.values())}


# ─── Montar Socket.IO sobre ASGI ────────────────────────────
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

# Punto de entrada para uvicorn: uvicorn main:socket_app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:socket_app", host="0.0.0.0", port=settings.port, reload=True)

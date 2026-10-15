from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from database.supabase_client import get_supabase
from models.user import ProfileUpdate, DriverStatusUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/")
async def list_users(
    role: Optional[str] = Query(None),
    approved: Optional[bool] = Query(None),
    limit: int = Query(50, le=100),
):
    """Lista usuarios (admin)."""
    try:
        supabase = get_supabase()
        query = supabase.table("profiles").select("*").order("created_at", desc=True).limit(limit)
        if role:
            query = query.eq("role", role)
        if approved is not None:
            query = query.eq("approved", approved)
        response = query.execute()
        return {"users": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_stats():
    """Métricas globales para el dashboard admin."""
    try:
        supabase = get_supabase()
        total_users = supabase.table("profiles").select("id", count="exact").execute()
        active_drivers = supabase.table("driver_status").select("id", count="exact").eq("status", "disponible").execute()
        pending_reports = supabase.table("reports").select("id", count="exact").eq("status", "pendiente").execute()
        total_routes = supabase.table("routes").select("id", count="exact").eq("active", True).execute()
        pending_drivers = supabase.table("profiles").select("id", count="exact").eq("role", "chofer").eq("approved", False).execute()

        return {
            "total_users": total_users.count or 0,
            "active_drivers": active_drivers.count or 0,
            "pending_reports": pending_reports.count or 0,
            "total_routes": total_routes.count or 0,
            "pending_drivers": pending_drivers.count or 0,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}")
async def get_user(user_id: str):
    """Obtiene perfil de un usuario."""
    try:
        supabase = get_supabase()
        response = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{user_id}")
async def update_user(user_id: str, update: ProfileUpdate):
    """Actualiza perfil de usuario."""
    try:
        supabase = get_supabase()
        data = {k: v for k, v in update.model_dump().items() if v is not None}
        data["updated_at"] = datetime.now(timezone.utc).isoformat()
        response = supabase.table("profiles").update(data).eq("id", user_id).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{user_id}/toggle-active")
async def toggle_user_active(user_id: str):
    """Activa/desactiva un usuario (admin)."""
    try:
        supabase = get_supabase()
        current = supabase.table("profiles").select("is_active").eq("id", user_id).single().execute()
        if not current.data:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        new_status = not current.data["is_active"]
        response = supabase.table("profiles").update({"is_active": new_status}).eq("id", user_id).execute()
        return {"is_active": new_status, "user": response.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{user_id}/approve-driver")
async def approve_driver(user_id: str):
    """Aprueba a un chofer (admin)."""
    try:
        supabase = get_supabase()
        response = supabase.table("profiles").update(
            {"approved": True, "updated_at": datetime.now(timezone.utc).isoformat()}
        ).eq("id", user_id).eq("role", "chofer").execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Chofer no encontrado")
        return {"message": "Chofer aprobado", "user": response.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{driver_id}/status")
async def update_driver_status(driver_id: str, status: DriverStatusUpdate):
    """Actualiza estado GPS del chofer."""
    try:
        supabase = get_supabase()
        data = {
            "driver_id": driver_id,
            "status": status.status,
            "route_id": status.route_id,
            "latitude": status.latitude,
            "longitude": status.longitude,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        response = supabase.table("driver_status").upsert(data, on_conflict="driver_id").execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{user_id}/upgrade")
async def upgrade_to_premium(user_id: str):
    """Activa plan Premium para un usuario (mock payment)."""
    try:
        supabase = get_supabase()
        response = supabase.table("profiles").update({
            "plan": "premium",
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return {"message": "Plan Premium activado", "plan": "premium"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/favorites")
async def get_favorites(user_id: str):
    """Obtiene rutas favoritas del usuario."""
    try:
        supabase = get_supabase()
        fav_response = supabase.table("favorites").select("*").eq("user_id", user_id).execute()
        favorites = fav_response.data

        if favorites:
            route_ids = [f["route_id"] for f in favorites if f.get("route_id")]
            if route_ids:
                routes_response = supabase.table("routes").select(
                    "id, numero, name, origin, destination, price, security"
                ).in_("id", route_ids).execute()
                routes_map = {r["id"]: r for r in routes_response.data}
                for fav in favorites:
                    if fav.get("route_id") and fav["route_id"] in routes_map:
                        fav["routes"] = routes_map[fav["route_id"]]

        return {"favorites": favorites}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{user_id}/favorites/{route_id}")
async def add_favorite(user_id: str, route_id: str, alias: Optional[str] = Query(None)):
    """Agrega una ruta favorita."""
    try:
        supabase = get_supabase()
        response = supabase.table("favorites").insert(
            {"user_id": user_id, "route_id": route_id, "alias": alias}
        ).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{user_id}/favorites/{route_id}")
async def remove_favorite(user_id: str, route_id: str):
    """Elimina una ruta favorita."""
    try:
        supabase = get_supabase()
        supabase.table("favorites").delete().eq("user_id", user_id).eq("route_id", route_id).execute()
        return {"message": "Favorito eliminado"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/trips")
async def get_trips(user_id: str):
    """Historial de viajes del usuario."""
    try:
        supabase = get_supabase()
        response = supabase.table("trips").select(
            "*"
        ).eq("user_id", user_id).order("created_at", desc=True).limit(20).execute()
        return {"trips": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# TrufiBot AI 🚐

> El primer asistente inteligente de movilidad urbana para Cochabamba, Bolivia.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 + Tailwind CSS + TypeScript |
| Backend | FastAPI + Uvicorn + Socket.IO |
| Base de datos | Supabase (PostgreSQL + Auth + Realtime) |
| Mapas | Leaflet.js (OpenStreetMap) |
| IA | Claude API (claude-sonnet) |
| Tiempo real | Socket.IO (GPS de choferes) |

---

## Estructura del proyecto

```
TrufiBot-AI/
├── frontend/          ← Next.js 14 App Router
│   ├── app/
│   │   ├── page.tsx                    ← Página principal con mapa
│   │   ├── chat/page.tsx               ← Chat IA split-panel
│   │   ├── auth/login/page.tsx
│   │   ├── auth/register/page.tsx
│   │   └── dashboard/
│   │       ├── user/page.tsx           ← Panel pasajero
│   │       ├── driver/page.tsx         ← Panel chofer
│   │       └── admin/page.tsx          ← Panel administrador
│   ├── components/
│   │   ├── chat/  (ChatWindow, MessageBubble, RouteCard)
│   │   ├── map/   (LeafletMap)
│   │   ├── ui/    (Header, SkeletonLoader)
│   │   └── layout/(DashboardLayout)
│   ├── contexts/AuthContext.tsx
│   ├── hooks/     (useChat, useMap, useReports)
│   ├── services/  (api.ts, supabase.ts)
│   └── middleware.ts                   ← Protección de rutas por rol
└── backend/           ← FastAPI
    ├── main.py                         ← App + Socket.IO
    ├── config.py
    ├── routers/   (chat, routes, reports, users)
    ├── services/  (ai_service, geo_service)
    ├── models/    (user, route, report)
    └── database/  (supabase_client, schema.sql, seed.sql)
```

---

## Setup rápido

### 1. Variables de entorno

**Backend** (`backend/.env`):
```env
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...
CORS_ORIGINS=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
```

### 2. Base de datos Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta en orden:
   - `backend/database/schema.sql`
   - `backend/database/seed.sql`

### 3. Backend (FastAPI)

```bash
cd backend

# Crear entorno virtual
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor
uvicorn main:socket_app --reload --port 8000
```

Swagger disponible en: http://localhost:8000/docs

### 4. Frontend (Next.js)

```bash
cd frontend

# Instalar dependencias (ya instaladas si seguiste el setup)
npm install

# Iniciar dev server
npm run dev
```

Abre: http://localhost:3000

---

## Roles de usuario

| Rol | Acceso | Credencial de prueba |
|-----|--------|---------------------|
| **Pasajero** | `/dashboard/user`, `/chat` | Registrarse con rol "Pasajero" |
| **Chofer** | `/dashboard/driver` | Registrarse con rol "Chofer" (requiere aprobación admin) |
| **Admin** | `/dashboard/admin` | Crear manualmente en Supabase con `role = 'admin'` |

Para crear un admin manualmente en Supabase:
```sql
UPDATE public.profiles
SET role = 'admin', approved = true
WHERE email = 'tu@email.com';
```

---

## Rutas de trufi incluidas (seed)

| Número | Ruta | Precio | Seguridad |
|--------|------|--------|-----------|
| 101 | Terminal → Quillacollo | Bs 2.50 | Alta |
| 244 | Plaza → Cala Cala | Bs 2.50 | Alta |
| 110 | UMSS → Cancha | Bs 2.00 | Media |
| 215 | Mayorazgo → Centro | Bs 2.50 | Alta |
| 120 | Ticti → Colcapirhua | Bs 3.00 | Media |
| 132 | Sacaba → Terminal | Bs 3.00 | Media |

---

## API Endpoints

### Chat
- `POST /api/chat/` — Enviar mensaje a TrufiBot IA
- `GET  /api/chat/routes-context` — Rutas disponibles para contexto

### Rutas
- `GET  /api/routes/` — Listar rutas activas
- `POST /api/routes/` — Crear ruta (admin)
- `PATCH /api/routes/{id}` — Actualizar ruta
- `DELETE /api/routes/{id}` — Desactivar ruta

### Reportes
- `GET  /api/reports/` — Listar reportes
- `POST /api/reports/` — Crear reporte ciudadano
- `PATCH /api/reports/{id}` — Cambiar estado (admin)
- `DELETE /api/reports/{id}` — Eliminar (admin)

### Usuarios
- `GET  /api/users/stats` — Métricas globales
- `GET  /api/users/` — Listar usuarios
- `PATCH /api/users/{id}/toggle-active` — Activar/desactivar
- `PATCH /api/users/{id}/approve-driver` — Aprobar chofer
- `POST /api/users/{id}/status` — Actualizar estado GPS del chofer

---

## Socket.IO eventos

| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `driver_location` | Chofer → Server | Emite ubicación GPS |
| `driver_update` | Server → Pasajeros | Broadcast de ubicación |
| `join_route` | Pasajero → Server | Unirse a sala de una ruta |
| `new_report` | Cliente → Server | Nuevo reporte de incidente |
| `report_alert` | Server → Admin | Alerta de reporte nuevo |

---

## Hecho con 💚 para Cochabamba, Bolivia

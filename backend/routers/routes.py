from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from database.supabase_client import get_supabase
from models.route import RouteCreate, RouteUpdate

router = APIRouter(prefix="/routes", tags=["routes"])


@router.get("/")
async def list_routes(
    active_only: bool = Query(True),
    security: Optional[str] = Query(None),
):
    """Lista todas las rutas, con filtros opcionales."""
    try:
        supabase = get_supabase()
        query = supabase.table("routes").select("*")
        if active_only:
            query = query.eq("active", True)
        if security:
            query = query.eq("security", security)
        response = query.order("numero").execute()
        return {"routes": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{route_id}")
async def get_route(route_id: str):
    """Obtiene una ruta por ID."""
    try:
        supabase = get_supabase()
        response = supabase.table("routes").select("*").eq("id", route_id).single().execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Ruta no encontrada")
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", status_code=201)
async def create_route(route: RouteCreate):
    """Crea una nueva ruta (solo admin)."""
    try:
        supabase = get_supabase()
        data = route.model_dump()
        response = supabase.table("routes").insert(data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{route_id}")
async def update_route(route_id: str, route: RouteUpdate):
    """Actualiza una ruta (solo admin)."""
    try:
        supabase = get_supabase()
        data = {k: v for k, v in route.model_dump().items() if v is not None}
        data["updated_at"] = datetime.now(timezone.utc).isoformat()
        response = supabase.table("routes").update(data).eq("id", route_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Ruta no encontrada")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{route_id}")
async def delete_route(route_id: str):
    """Desactiva una ruta (soft delete)."""
    try:
        supabase = get_supabase()
        supabase.table("routes").update({"active": False}).eq("id", route_id).execute()
        return {"message": "Ruta desactivada exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search/")
async def search_routes(
    origin: Optional[str] = Query(None),
    destination: Optional[str] = Query(None),
):
    """Busca rutas por origen o destino."""
    try:
        supabase = get_supabase()
        query = supabase.table("routes").select("*").eq("active", True)
        if origin:
            query = query.ilike("origin", f"%{origin}%")
        if destination:
            query = query.ilike("destination", f"%{destination}%")
        response = query.execute()
        return {"routes": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

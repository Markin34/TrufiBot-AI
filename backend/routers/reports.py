from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from database.supabase_client import get_supabase
from models.report import ReportCreate, ReportUpdate

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/")
async def list_reports(
    status: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
):
    """Lista reportes ciudadanos."""
    try:
        supabase = get_supabase()
        query = supabase.table("reports").select(
            "*, profiles(full_name, email)"
        ).order("created_at", desc=True).limit(limit)
        if status:
            query = query.eq("status", status)
        response = query.execute()
        return {"reports": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", status_code=201)
async def create_report(report: ReportCreate, user_id: Optional[str] = Query(None)):
    """Crea un nuevo reporte ciudadano."""
    try:
        supabase = get_supabase()
        data = report.model_dump()
        data["user_id"] = user_id
        response = supabase.table("reports").insert(data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{report_id}")
async def update_report_status(report_id: str, update: ReportUpdate):
    """Actualiza el estado de un reporte (admin)."""
    try:
        supabase = get_supabase()
        response = supabase.table("reports").update(
            {"status": update.status}
        ).eq("id", report_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Reporte no encontrado")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{report_id}")
async def delete_report(report_id: str):
    """Elimina permanentemente un reporte (admin)."""
    try:
        supabase = get_supabase()
        supabase.table("reports").delete().eq("id", report_id).execute()
        return {"message": "Reporte eliminado"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/summary")
async def reports_summary():
    """Estadísticas de reportes para el dashboard admin."""
    try:
        supabase = get_supabase()
        pending = supabase.table("reports").select("id", count="exact").eq("status", "pendiente").execute()
        reviewed = supabase.table("reports").select("id", count="exact").eq("status", "revisado").execute()
        return {
            "pendiente": pending.count or 0,
            "revisado": reviewed.count or 0,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

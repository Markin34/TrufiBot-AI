from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReportCreate(BaseModel):
    route_id: Optional[str] = None
    type: str  # accidente | retraso | superpoblado | desvio | otro
    description: str
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None


class ReportUpdate(BaseModel):
    status: str  # pendiente | revisado | eliminado


class Report(ReportCreate):
    id: str
    user_id: Optional[str] = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProfileBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    role: str = "pasajero"
    phone: Optional[str] = None


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


class Profile(ProfileBase):
    id: str
    is_active: bool
    approved: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DriverStatusUpdate(BaseModel):
    status: str  # disponible | ocupado | fuera_de_servicio
    route_id: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

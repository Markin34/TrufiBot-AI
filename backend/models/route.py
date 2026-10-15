from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class Stop(BaseModel):
    name: str


class Coordinate(BaseModel):
    lat: float
    lng: float


class RouteBase(BaseModel):
    numero: str
    name: str
    origin: str
    destination: str
    price: float
    security: str = "media"
    stops: List[str] = []
    coordinates: List[dict] = []
    active: bool = True


class RouteCreate(RouteBase):
    pass


class RouteUpdate(BaseModel):
    name: Optional[str] = None
    origin: Optional[str] = None
    destination: Optional[str] = None
    price: Optional[float] = None
    security: Optional[str] = None
    stops: Optional[List[str]] = None
    coordinates: Optional[List[dict]] = None
    active: Optional[bool] = None


class Route(RouteBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

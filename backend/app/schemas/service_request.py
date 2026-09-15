from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.models import RequestStatus


class ServiceRequestCreate(BaseModel):
    ngo_id: int = Field(..., gt=0)
    service_id: int = Field(..., gt=0)
    description: str = Field(..., min_length=1)
    location: Optional[str] = None


class ServiceRequestStatusUpdate(BaseModel):
    status: RequestStatus


class ServiceRequestResponse(BaseModel):
    id: int
    user_id: int
    ngo_id: Optional[int] = None
    service_type: str
    description: str
    location: Optional[str] = None
    status: RequestStatus
    created_at: datetime

    class Config:
        from_attributes = True
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class NGOCreate(BaseModel):
    organization_name: str
    description: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None


class NGOResponse(BaseModel):
    id: int
    user_id: int
    organization_name: str
    description: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    status: str
    approved_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
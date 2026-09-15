from datetime import date as Date
from datetime import datetime, time
from typing import Optional

from pydantic import BaseModel, Field

from app.models.models import (
    OpportunityType,
    PaymentType,
    OpportunityStatus,
)


class OpportunityBase(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None

    opportunity_type: OpportunityType
    payment_type: PaymentType

    location: Optional[str] = None

    date: Optional[Date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None

    requirements: Optional[str] = None

    capacity: Optional[int] = Field(
        None,
        gt=0
    )

    application_deadline: Optional[datetime] = None


class OpportunityCreate(OpportunityBase):
    pass


class OpportunityUpdate(BaseModel):
    title: Optional[str] = Field(
        None,
        min_length=1
    )

    description: Optional[str] = None

    opportunity_type: Optional[OpportunityType] = None
    payment_type: Optional[PaymentType] = None

    location: Optional[str] = None

    date: Optional[Date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None

    requirements: Optional[str] = None

    capacity: Optional[int] = Field(
        None,
        gt=0
    )

    application_deadline: Optional[datetime] = None


class OpportunityStatusUpdate(BaseModel):
    status: OpportunityStatus


class OpportunityResponse(OpportunityBase):
    id: int
    ngo_id: int
    status: OpportunityStatus
    original_opportunity_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
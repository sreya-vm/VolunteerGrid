from datetime import datetime
from pydantic import BaseModel

from app.models.models import OpportunityType, PaymentType


class OpportunityCreate(BaseModel):
    title: str
    description: str

    opportunity_type: OpportunityType
    payment_type: PaymentType

    location: str | None = None
    date: datetime | None = None

    start_time: datetime | None = None
    end_time: datetime | None = None

    requirements: str | None = None
    capacity: int | None = None

    application_deadline: datetime | None = None
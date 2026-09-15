from pydantic import BaseModel
from typing import Optional


# ============================================================
# VOLUNTEER PROFILE
# ============================================================

class VolunteerProfileBase(BaseModel):
    skills: Optional[str] = None
    interests: Optional[str] = None
    availability: Optional[str] = None
    location: Optional[str] = None


class VolunteerProfileCreate(VolunteerProfileBase):
    pass


class VolunteerProfileUpdate(VolunteerProfileBase):
    pass


class VolunteerProfileResponse(VolunteerProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
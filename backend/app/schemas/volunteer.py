from pydantic import BaseModel


class VolunteerRegistrationRequest(BaseModel):
    skills: str | None = None
    interests: str | None = None
    availability: str | None = None
    location: str | None = None


class VolunteerProfileResponse(BaseModel):
    id: int
    user_id: int
    skills: str | None
    interests: str | None
    availability: str | None
    location: str | None

    class Config:
        from_attributes = True
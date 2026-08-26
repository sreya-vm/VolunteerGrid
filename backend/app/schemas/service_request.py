from pydantic import BaseModel


class ServiceRequestCreate(BaseModel):
    ngo_id: int
    service_type: str
    description: str
    location: str | None = None


from pydantic import BaseModel


class ServiceRequestCreate(BaseModel):
    ngo_id: int
    service_id: int
    description: str
    location: str | None = None


class ServiceRequestResponse(BaseModel):
    id: int
    user_id: int
    ngo_id: int | None
    service_type: str
    description: str
    location: str | None
    status: str

    class Config:
        from_attributes = True
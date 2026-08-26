from pydantic import BaseModel


class NGOResponse(BaseModel):
    id: int
    organization_name: str
    description: str | None = None
    address: str | None = None
    website: str | None = None

    class Config:
        from_attributes = True


class ServiceResponse(BaseModel):
    id: int
    name: str
    description: str

    class Config:
        from_attributes = True


class OpportunityResponse(BaseModel):
    id: int
    ngo_id: int
    title: str
    description: str
    location: str | None = None
    date: object | None = None
    capacity: int | None = None

    class Config:
        from_attributes = True
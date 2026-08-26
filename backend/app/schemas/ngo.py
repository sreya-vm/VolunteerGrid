from pydantic import BaseModel


class NGOCreate(BaseModel):
    organization_name: str
    description: str | None = None
    address: str | None = None
    website: str | None = None
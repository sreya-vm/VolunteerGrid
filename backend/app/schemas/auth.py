from pydantic import BaseModel, EmailStr
from enum import Enum


class RegistrationRole(str, Enum):
    USER = "user"
    NGO = "ngo"


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: RegistrationRole
    phone: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
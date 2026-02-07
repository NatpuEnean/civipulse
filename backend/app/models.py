# app/models.py
from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str            # "admin" | "department_user"
    department: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

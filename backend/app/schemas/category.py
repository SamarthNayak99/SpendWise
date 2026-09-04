import uuid
from datetime import datetime
from pydantic import BaseModel, Field


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    icon: str = Field(default="💰", max_length=50)
    color: str = Field(default="#4ade80", pattern=r"^#[0-9a-fA-F]{6}$")


class CategoryUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    icon: str | None = Field(None, max_length=50)
    color: str | None = Field(None, pattern=r"^#[0-9a-fA-F]{6}$")


class CategoryOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID | None
    name: str
    icon: str
    color: str
    is_default: bool
    created_at: datetime

    model_config = {"from_attributes": True}

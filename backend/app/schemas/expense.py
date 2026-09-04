import uuid
from datetime import datetime, date
from pydantic import BaseModel, Field
from app.models.expense import ExpenseType
from app.schemas.category import CategoryOut


class ExpenseCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    amount: float = Field(..., gt=0)
    type: ExpenseType
    date: date
    category_id: uuid.UUID | None = None
    notes: str | None = None
    is_recurring: bool = False


class ExpenseUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    amount: float | None = Field(None, gt=0)
    type: ExpenseType | None = None
    date: date | None = None
    category_id: uuid.UUID | None = None
    notes: str | None = None
    is_recurring: bool | None = None


class ExpenseOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    category_id: uuid.UUID | None
    category: CategoryOut | None
    title: str
    amount: float
    type: ExpenseType
    date: date
    notes: str | None
    is_recurring: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

import uuid
from datetime import datetime
from datetime import date as DateType   # aliased to avoid clash with field name 'date'
from typing import Optional
from pydantic import BaseModel, Field
from app.models.expense import ExpenseType
from app.schemas.category import CategoryOut


class ExpenseCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    amount: float = Field(..., gt=0)
    type: ExpenseType
    date: DateType
    category_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None
    is_recurring: bool = False


class ExpenseUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    amount: Optional[float] = Field(None, gt=0)
    type: Optional[ExpenseType] = None
    date: Optional[DateType] = None
    category_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None
    is_recurring: Optional[bool] = None


class ExpenseOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    category_id: Optional[uuid.UUID]
    category: Optional[CategoryOut]
    title: str
    amount: float
    type: ExpenseType
    date: DateType
    notes: Optional[str]
    is_recurring: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

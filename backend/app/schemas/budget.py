import uuid
from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.category import CategoryOut


class BudgetCreate(BaseModel):
    category_id: uuid.UUID
    amount: float = Field(..., gt=0)
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2000, le=2100)
    alert_threshold: float = Field(default=0.80, ge=0.0, le=1.0)


class BudgetUpdate(BaseModel):
    amount: float | None = Field(None, gt=0)
    alert_threshold: float | None = Field(None, ge=0.0, le=1.0)


class BudgetOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    category_id: uuid.UUID
    category: CategoryOut
    amount: float
    month: int
    year: int
    alert_threshold: float
    created_at: datetime

    model_config = {"from_attributes": True}


class BudgetStatus(BaseModel):
    """Budget with real-time spending data for dashboard/alerts."""
    id: uuid.UUID
    category: CategoryOut
    budget_amount: float
    spent_amount: float
    percentage: float          # spent / budget * 100
    remaining: float           # budget - spent
    is_over_threshold: bool    # spent/budget >= alert_threshold
    is_over_budget: bool       # spent > budget
    month: int
    year: int

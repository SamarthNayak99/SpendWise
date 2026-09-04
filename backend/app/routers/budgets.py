import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.user import User
from app.models.budget import Budget
from app.models.expense import Expense, ExpenseType
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetOut, BudgetStatus
from app.schemas.category import CategoryOut
from app.dependencies.auth import get_current_user

router = APIRouter()


@router.get("", response_model=list[BudgetOut])
async def list_budgets(
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=2000),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List budgets for the current user, optionally filtered by month/year."""
    query = (
        select(Budget)
        .options(selectinload(Budget.category))
        .where(Budget.user_id == current_user.id)
    )
    if month:
        query = query.where(Budget.month == month)
    if year:
        query = query.where(Budget.year == year)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/status", response_model=list[BudgetStatus])
async def get_budget_status(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns each budget with actual spending for the given month/year.
    Computes: spent, percentage, remaining, is_over_threshold, is_over_budget.
    This is the key endpoint for dashboard alerts and progress bars.
    """
    # Fetch budgets
    budgets_result = await db.execute(
        select(Budget)
        .options(selectinload(Budget.category))
        .where(Budget.user_id == current_user.id, Budget.month == month, Budget.year == year)
    )
    budgets = budgets_result.scalars().all()

    if not budgets:
        return []

    # Aggregate spending per category for that month/year
    from sqlalchemy import extract
    spent_result = await db.execute(
        select(Expense.category_id, func.sum(Expense.amount).label("total"))
        .where(
            Expense.user_id == current_user.id,
            Expense.type == ExpenseType.expense,
            extract("month", Expense.date) == month,
            extract("year", Expense.date) == year,
        )
        .group_by(Expense.category_id)
    )
    spent_map = {row.category_id: float(row.total) for row in spent_result}

    statuses = []
    for budget in budgets:
        spent = spent_map.get(budget.category_id, 0.0)
        budget_amount = float(budget.amount)
        percentage = (spent / budget_amount * 100) if budget_amount > 0 else 0.0
        threshold = float(budget.alert_threshold)

        statuses.append(
            BudgetStatus(
                id=budget.id,
                category=CategoryOut.model_validate(budget.category),
                budget_amount=budget_amount,
                spent_amount=spent,
                percentage=round(percentage, 2),
                remaining=round(budget_amount - spent, 2),
                is_over_threshold=(spent / budget_amount >= threshold) if budget_amount > 0 else False,
                is_over_budget=spent > budget_amount,
                month=budget.month,
                year=budget.year,
            )
        )
    return statuses


@router.post("", response_model=BudgetOut, status_code=status.HTTP_201_CREATED)
async def create_budget(
    body: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Set a monthly budget for a category."""
    # Prevent duplicate budget for same category+month+year
    existing = await db.execute(
        select(Budget).where(
            Budget.user_id == current_user.id,
            Budget.category_id == body.category_id,
            Budget.month == body.month,
            Budget.year == body.year,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="Budget already exists for this category and month/year",
        )

    budget = Budget(user_id=current_user.id, **body.model_dump())
    db.add(budget)
    await db.commit()
    await db.refresh(budget)
    result = await db.execute(
        select(Budget).options(selectinload(Budget.category)).where(Budget.id == budget.id)
    )
    return result.scalar_one()


@router.put("/{budget_id}", response_model=BudgetOut)
async def update_budget(
    budget_id: uuid.UUID,
    body: BudgetUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a budget's amount or alert threshold."""
    result = await db.execute(
        select(Budget).where(Budget.id == budget_id, Budget.user_id == current_user.id)
    )
    budget = result.scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(budget, field, value)

    await db.commit()
    await db.refresh(budget)
    result = await db.execute(
        select(Budget).options(selectinload(Budget.category)).where(Budget.id == budget.id)
    )
    return result.scalar_one()


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_budget(
    budget_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a budget."""
    result = await db.execute(
        select(Budget).where(Budget.id == budget_id, Budget.user_id == current_user.id)
    )
    budget = result.scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    await db.delete(budget)
    await db.commit()

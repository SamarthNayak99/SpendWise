import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.user import User
from app.models.expense import Expense, ExpenseType
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseOut
from app.dependencies.auth import get_current_user
from datetime import date

router = APIRouter()


@router.get("", response_model=list[ExpenseOut])
async def list_expenses(
    type: Optional[ExpenseType] = Query(None, description="Filter by income or expense"),
    category_id: Optional[uuid.UUID] = Query(None),
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    search: Optional[str] = Query(None, description="Search by title or notes"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List all expenses for the current user with optional filters.
    Filters: type, category, date range, text search.
    """
    query = (
        select(Expense)
        .options(selectinload(Expense.category))
        .where(Expense.user_id == current_user.id)
    )

    if type:
        query = query.where(Expense.type == type)
    if category_id:
        query = query.where(Expense.category_id == category_id)
    if from_date:
        query = query.where(Expense.date >= from_date)
    if to_date:
        query = query.where(Expense.date <= to_date)
    if search:
        query = query.where(
            or_(Expense.title.ilike(f"%{search}%"), Expense.notes.ilike(f"%{search}%"))
        )

    query = query.order_by(Expense.date.desc(), Expense.created_at.desc())
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
async def create_expense(
    body: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new expense or income entry."""
    expense = Expense(user_id=current_user.id, **body.model_dump())
    db.add(expense)
    await db.commit()
    await db.refresh(expense)
    # Reload with category relationship
    result = await db.execute(
        select(Expense).options(selectinload(Expense.category)).where(Expense.id == expense.id)
    )
    return result.scalar_one()


@router.get("/{expense_id}", response_model=ExpenseOut)
async def get_expense(
    expense_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single expense by ID."""
    result = await db.execute(
        select(Expense)
        .options(selectinload(Expense.category))
        .where(Expense.id == expense_id, Expense.user_id == current_user.id)
    )
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@router.put("/{expense_id}", response_model=ExpenseOut)
async def update_expense(
    expense_id: uuid.UUID,
    body: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing expense. Only the owner can update."""
    result = await db.execute(
        select(Expense).where(Expense.id == expense_id, Expense.user_id == current_user.id)
    )
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(expense, field, value)

    await db.commit()
    await db.refresh(expense)
    result = await db.execute(
        select(Expense).options(selectinload(Expense.category)).where(Expense.id == expense.id)
    )
    return result.scalar_one()


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(
    expense_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete an expense. Only the owner can delete."""
    result = await db.execute(
        select(Expense).where(Expense.id == expense_id, Expense.user_id == current_user.id)
    )
    expense = result.scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    await db.delete(expense)
    await db.commit()

import csv
import io
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract, case
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.user import User
from app.models.expense import Expense, ExpenseType
from app.models.category import Category
from app.dependencies.auth import get_current_user

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard(
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=2000),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Main dashboard summary:
    - All-time balance (total income - total expenses)
    - This month's income, expenses, and savings rate
    - Recent 5 expenses
    """
    from datetime import datetime
    now = datetime.now()
    m = month or now.month
    y = year or now.year

    # All-time totals
    totals_result = await db.execute(
        select(
            func.sum(case((Expense.type == ExpenseType.income, Expense.amount), else_=0)).label("total_income"),
            func.sum(case((Expense.type == ExpenseType.expense, Expense.amount), else_=0)).label("total_expenses"),
        ).where(Expense.user_id == current_user.id)
    )
    totals = totals_result.one()
    total_income = float(totals.total_income or 0)
    total_expenses = float(totals.total_expenses or 0)

    # This month's totals
    month_result = await db.execute(
        select(
            func.sum(case((Expense.type == ExpenseType.income, Expense.amount), else_=0)).label("income"),
            func.sum(case((Expense.type == ExpenseType.expense, Expense.amount), else_=0)).label("expenses"),
        ).where(
            Expense.user_id == current_user.id,
            extract("month", Expense.date) == m,
            extract("year", Expense.date) == y,
        )
    )
    month_data = month_result.one()
    month_income = float(month_data.income or 0)
    month_expenses = float(month_data.expenses or 0)
    savings_rate = ((month_income - month_expenses) / month_income * 100) if month_income > 0 else 0

    # Recent 5 expenses
    recent_result = await db.execute(
        select(Expense)
        .options(selectinload(Expense.category))
        .where(Expense.user_id == current_user.id)
        .order_by(Expense.date.desc(), Expense.created_at.desc())
        .limit(5)
    )
    recent = recent_result.scalars().all()

    return {
        "balance": round(total_income - total_expenses, 2),
        "total_income": round(total_income, 2),
        "total_expenses": round(total_expenses, 2),
        "month": {
            "month": m,
            "year": y,
            "income": round(month_income, 2),
            "expenses": round(month_expenses, 2),
            "savings_rate": round(savings_rate, 2),
            "net": round(month_income - month_expenses, 2),
        },
        "recent_expenses": [
            {
                "id": str(e.id),
                "title": e.title,
                "amount": float(e.amount),
                "type": e.type.value,
                "date": e.date.isoformat(),
                "category": {"name": e.category.name, "icon": e.category.icon, "color": e.category.color} if e.category else None,
            }
            for e in recent
        ],
    }


@router.get("/trends")
async def get_trends(
    months: int = Query(6, ge=1, le=24),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Monthly income vs expense trends for the last N months.
    Returns data shaped for a line/bar chart.
    """
    result = await db.execute(
        select(
            extract("year", Expense.date).label("year"),
            extract("month", Expense.date).label("month"),
            func.sum(case((Expense.type == ExpenseType.income, Expense.amount), else_=0)).label("income"),
            func.sum(case((Expense.type == ExpenseType.expense, Expense.amount), else_=0)).label("expenses"),
        )
        .where(Expense.user_id == current_user.id)
        .group_by("year", "month")
        .order_by("year", "month")
        .limit(months)
    )
    rows = result.all()

    import calendar
    return [
        {
            "label": f"{calendar.month_abbr[int(row.month)]} {int(row.year)}",
            "month": int(row.month),
            "year": int(row.year),
            "income": float(row.income or 0),
            "expenses": float(row.expenses or 0),
            "net": float((row.income or 0) - (row.expenses or 0)),
        }
        for row in rows
    ]


@router.get("/category-breakdown")
async def get_category_breakdown(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Total spending per category — used for pie chart.
    Only counts 'expense' type entries.
    """
    query = (
        select(
            Category.id,
            Category.name,
            Category.icon,
            Category.color,
            func.sum(Expense.amount).label("total"),
        )
        .join(Expense, Expense.category_id == Category.id)
        .where(Expense.user_id == current_user.id, Expense.type == ExpenseType.expense)
    )
    if from_date:
        query = query.where(Expense.date >= from_date)
    if to_date:
        query = query.where(Expense.date <= to_date)

    query = query.group_by(Category.id, Category.name, Category.icon, Category.color)
    query = query.order_by(func.sum(Expense.amount).desc())

    result = await db.execute(query)
    rows = result.all()

    total_all = sum(float(r.total) for r in rows)
    return [
        {
            "category_id": str(r.id),
            "name": r.name,
            "icon": r.icon,
            "color": r.color,
            "total": float(r.total),
            "percentage": round(float(r.total) / total_all * 100, 2) if total_all > 0 else 0,
        }
        for r in rows
    ]


@router.get("/export")
async def export_csv(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Export all expenses for the current user as a CSV file."""
    query = (
        select(Expense)
        .options(selectinload(Expense.category))
        .where(Expense.user_id == current_user.id)
        .order_by(Expense.date.desc())
    )
    if from_date:
        query = query.where(Expense.date >= from_date)
    if to_date:
        query = query.where(Expense.date <= to_date)

    result = await db.execute(query)
    expenses = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Title", "Amount", "Type", "Category", "Notes"])
    for e in expenses:
        writer.writerow([
            e.date.isoformat(),
            e.title,
            float(e.amount),
            e.type.value,
            e.category.name if e.category else "",
            e.notes or "",
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=spendwise_export.csv"},
    )

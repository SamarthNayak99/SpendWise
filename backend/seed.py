"""
Seed script — inserts default categories into the database.
Run after the initial Alembic migration:

    python seed.py
"""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.config import settings
from app.models.category import Category

DEFAULT_CATEGORIES = [
    {"name": "Food & Dining",    "icon": "🍔", "color": "#f97316"},
    {"name": "Transport",        "icon": "🚗", "color": "#3b82f6"},
    {"name": "Shopping",         "icon": "🛍️", "color": "#a855f7"},
    {"name": "Entertainment",    "icon": "🎮", "color": "#ec4899"},
    {"name": "Health & Medical", "icon": "💊", "color": "#ef4444"},
    {"name": "Housing & Rent",   "icon": "🏠", "color": "#f59e0b"},
    {"name": "Utilities",        "icon": "⚡", "color": "#06b6d4"},
    {"name": "Education",        "icon": "📚", "color": "#8b5cf6"},
    {"name": "Travel",           "icon": "✈️", "color": "#10b981"},
    {"name": "Salary",           "icon": "💼", "color": "#4ade80"},
    {"name": "Freelance",        "icon": "💻", "color": "#22d3ee"},
    {"name": "Investment",       "icon": "📈", "color": "#84cc16"},
    {"name": "Other",            "icon": "💰", "color": "#6b7280"},
]


async def seed():
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with session_factory() as session:
        from sqlalchemy import select
        result = await session.execute(select(Category).where(Category.is_default == True))
        existing = result.scalars().all()

        if existing:
            print(f"✅ {len(existing)} default categories already exist. Skipping seed.")
            return

        for cat_data in DEFAULT_CATEGORIES:
            category = Category(
                name=cat_data["name"],
                icon=cat_data["icon"],
                color=cat_data["color"],
                is_default=True,
                user_id=None,  # Global — visible to all users
            )
            session.add(category)

        await session.commit()
        print(f"🌱 Seeded {len(DEFAULT_CATEGORIES)} default categories successfully!")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())

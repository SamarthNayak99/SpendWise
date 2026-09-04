import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Numeric, SmallInteger, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Budget(Base):
    __tablename__ = "budgets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id", ondelete="CASCADE"), nullable=False
    )
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    month: Mapped[int] = mapped_column(SmallInteger, nullable=False)   # 1–12
    year: Mapped[int] = mapped_column(SmallInteger, nullable=False)    # e.g. 2026
    # Alert when (spent / amount) >= alert_threshold. e.g. 0.80 = 80%
    alert_threshold: Mapped[float] = mapped_column(Numeric(5, 2), default=0.80, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="budgets")  # noqa: F821
    category: Mapped["Category"] = relationship("Category", back_populates="budgets")  # noqa: F821

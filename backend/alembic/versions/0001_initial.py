"""initial_schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-09-04

Creates all core tables: users, categories, expenses, budgets.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── Enum type ─────────────────────────────────────────────────────────────
    op.execute("CREATE TYPE IF NOT EXISTS expense_type AS ENUM ('income', 'expense')")

    # ── users ──────────────────────────────────────────────────────────────────
    op.create_table(
        'users',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('username', sa.String(100), nullable=False),
        sa.Column('hashed_password', sa.Text, nullable=False),
        sa.Column('currency_symbol', sa.String(5), nullable=False, server_default='₹'),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.UniqueConstraint('email', name='uq_users_email'),
        sa.UniqueConstraint('username', name='uq_users_username'),
    )
    op.create_index('ix_users_email', 'users', ['email'])

    # ── categories ────────────────────────────────────────────────────────────
    op.create_table(
        'categories',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('icon', sa.String(50), nullable=False, server_default='💰'),
        sa.Column('color', sa.String(7), nullable=False, server_default='#4ade80'),
        sa.Column('is_default', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )
    op.create_index('ix_categories_user_id', 'categories', ['user_id'])

    # ── expenses ──────────────────────────────────────────────────────────────
    op.create_table(
        'expenses',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('category_id', UUID(as_uuid=True), sa.ForeignKey('categories.id', ondelete='SET NULL'), nullable=True),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('amount', sa.Numeric(12, 2), nullable=False),
        sa.Column('type', sa.Enum('income', 'expense', name='expense_type', create_type=False), nullable=False),
        sa.Column('date', sa.Date, nullable=False),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('is_recurring', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )
    op.create_index('ix_expenses_user_id', 'expenses', ['user_id'])

    # ── budgets ───────────────────────────────────────────────────────────────
    op.create_table(
        'budgets',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('category_id', UUID(as_uuid=True), sa.ForeignKey('categories.id', ondelete='CASCADE'), nullable=False),
        sa.Column('amount', sa.Numeric(12, 2), nullable=False),
        sa.Column('month', sa.Integer, nullable=False),
        sa.Column('year', sa.Integer, nullable=False),
        sa.Column('alert_threshold', sa.Numeric(5, 2), nullable=False, server_default='80'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.UniqueConstraint('user_id', 'category_id', 'month', 'year', name='uq_budget_per_category_month'),
    )
    op.create_index('ix_budgets_user_id', 'budgets', ['user_id'])


def downgrade() -> None:
    op.drop_table('budgets')
    op.drop_table('expenses')
    op.drop_table('categories')
    op.drop_table('users')
    op.execute("DROP TYPE IF EXISTS expense_type")

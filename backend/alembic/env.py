from logging.config import fileConfig
from sqlalchemy import pool, create_engine
from alembic import context

# Import Base and all models so Alembic can detect them
from app.database import Base
from app.models import User, Category, Expense, Budget  # noqa: F401
from app.config import settings
import os
from dotenv import load_dotenv
load_dotenv()

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

# ── Build a sync URL from our async DATABASE_URL ──────────────────────────────
# We do NOT use config.set_main_option() because configparser treats '%' as a
# special interpolation character and will choke on percent-encoded passwords
# (e.g. %40 for '@').  Instead we pass the URL directly to create_engine().

def _make_sync_url(url: str) -> str:
    """Convert any postgresql:// variant to a psycopg2 sync URL."""
    if url.startswith("postgresql+asyncpg://"):
        return url.replace("postgresql+asyncpg://", "postgresql+psycopg2://", 1)
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg2://", 1)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url


# Prefer DATABASE_URL_SYNC if set (direct Supabase connection, avoids PgBouncer timezone bug).
# Otherwise fall back to converting the async URL.
SYNC_URL = settings.DATABASE_URL_SYNC or _make_sync_url(settings.DATABASE_URL)


def run_migrations_offline() -> None:
    context.configure(
        url=SYNC_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = context.config.attributes.get("connection", None)

    if connectable is None:
        # Pass URL directly — never goes through configparser
        # connect_args sets timezone to UTC for Supabase's connection pooler
        connectable = create_engine(
            SYNC_URL,
            poolclass=pool.NullPool,
            connect_args={"options": "-c timezone=UTC"},
        )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

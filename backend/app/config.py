from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    # Database — async URL used at runtime
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/spendwise"
    # Optional sync URL for Alembic (uses psycopg2). If not set, alembic converts DATABASE_URL.
    DATABASE_URL_SYNC: Optional[str] = None

    # JWT
    SECRET_KEY: str = "change-this-to-a-long-random-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",
        "https://spendwise.vercel.app",  # Production frontend
    ]

    # App
    APP_NAME: str = "SpendWise"
    ENV: str = "development"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

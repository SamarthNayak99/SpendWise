from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, expenses, categories, budgets, analytics

app = FastAPI(
    title="SpendWise API",
    description="Full-stack expense tracker — backend API",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,       prefix="/auth",       tags=["Auth"])
app.include_router(expenses.router,   prefix="/expenses",   tags=["Expenses"])
app.include_router(categories.router, prefix="/categories", tags=["Categories"])
app.include_router(budgets.router,    prefix="/budgets",    tags=["Budgets"])
app.include_router(analytics.router,  prefix="/analytics",  tags=["Analytics"])


@app.get("/", tags=["Health"])
async def root():
    return {"message": "SpendWise API is running 🚀", "docs": "/docs"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}

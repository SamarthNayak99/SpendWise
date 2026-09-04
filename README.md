# 💸 SpendWise

> A full-stack, multi-user **Expense Tracker** built with FastAPI, PostgreSQL, React, and JWT authentication.

[![Backend CI](https://github.com/SamarthNayak99/SpendWise/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/SamarthNayak99/SpendWise/actions/workflows/backend-ci.yml)
[![Frontend CI](https://github.com/SamarthNayak99/SpendWise/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/SamarthNayak99/SpendWise/actions/workflows/frontend-ci.yml)

---

## ✨ Features

- 🔐 **JWT Authentication** — Signup, login, protected routes
- 💰 **Full CRUD** — Add, view, edit, delete expenses & income
- 📊 **Analytics Dashboard** — Balance, charts, category breakdown
- 🎯 **Budget Goals** — Monthly budgets with alert thresholds
- 🗂️ **Custom Categories** — Icons, colors, per-user categories
- 📤 **CSV Export** — Download all your data
- 🌙 **Dark/Light Mode** — Toggle between themes
- 📱 **Responsive** — Works on mobile and desktop

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS + CSS Variables |
| Charts | Recharts |
| HTTP Client | Axios |
| Backend | Python + FastAPI (async) |
| ORM | SQLAlchemy (async) + Alembic |
| Database | PostgreSQL |
| Auth | JWT (python-jose) + bcrypt |
| Validation | Pydantic v2 |
| Deploy | Render (BE) + Vercel (FE) |
| CI/CD | GitHub Actions |

---

## 🚀 Local Development

### Prerequisites
- Python 3.12+
- Node.js 20+
- Docker Desktop (for PostgreSQL)

### 1. Clone the repo
```bash
git clone https://github.com/SamarthNayak99/SpendWise.git
cd SpendWise
```

### 2. Start PostgreSQL with Docker
```bash
docker-compose up db -d
```

### 3. Set up the backend
```bash
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment variables
copy .env.example .env
# Edit .env with your SECRET_KEY

# Run database migrations
alembic upgrade head

# Seed default categories
python seed.py

# Start the API server
uvicorn app.main:app --reload
```

API docs available at: **http://localhost:8000/docs** 📖

### 4. Set up the frontend
```bash
cd frontend

# Install dependencies
npm install

# Copy and configure environment variables
copy .env.example .env

# Start the dev server
npm run dev
```

Frontend available at: **http://localhost:5173** 🎨

---

## 📁 Project Structure

```
SpendWise/
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── models/   # SQLAlchemy ORM models
│   │   ├── schemas/  # Pydantic request/response schemas
│   │   ├── routers/  # API route handlers
│   │   ├── utils/    # JWT + bcrypt helpers
│   │   └── dependencies/ # FastAPI dependencies
│   ├── alembic/      # DB migrations
│   └── seed.py       # Default category seed
│
├── frontend/         # React + Vite frontend
│   └── src/
│       ├── api/      # Axios API functions
│       ├── context/  # Auth + Theme contexts
│       ├── components/ # Reusable UI components
│       └── pages/    # Route pages
│
├── .github/workflows/ # GitHub Actions CI/CD
└── docker-compose.yml # Local dev setup
```

---

## 🌐 API Documentation

Interactive Swagger UI available at `/docs` when running locally.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Register |
| POST | `/auth/login` | Login → JWT |
| GET | `/auth/me` | Current user |
| GET | `/expenses` | List expenses (with filters) |
| POST | `/expenses` | Create expense |
| GET | `/analytics/dashboard` | Dashboard data |
| GET | `/analytics/trends` | Monthly trends |
| GET | `/analytics/export` | Export CSV |

---

## 🚢 Deployment

### Backend (Render/Railway)
1. Connect your GitHub repo
2. Set root directory to `backend/`
3. Build command: `pip install -r requirements.txt && alembic upgrade head && python seed.py`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env.example`

### Frontend (Vercel)
1. Connect your GitHub repo
2. Set root directory to `frontend/`
3. Add `VITE_API_URL=https://your-backend-url.onrender.com`
4. Deploy!

---

## 📚 Learning Outcomes

This project teaches:
- **HTTP → REST API design** with FastAPI
- **Database design** — relational schema, foreign keys, ORM
- **Authentication** — bcrypt hashing, JWT tokens, stateless auth
- **Authorization** — user_id filtering on every query
- **React** — Context API, hooks, component design
- **SQL aggregation** — GROUP BY, SUM for analytics
- **CI/CD** — GitHub Actions pipelines
- **Cloud deployment** — environment config, CORS

---

## 📄 License

MIT License — feel free to use this for your portfolio!

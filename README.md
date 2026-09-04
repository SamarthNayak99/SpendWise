# 💸 SpendWise — Smart Expense Tracker

A full-stack personal finance tracker built with **FastAPI + React + Supabase PostgreSQL**.

![SpendWise Dashboard](https://img.shields.io/badge/Status-Live-brightgreen) ![Python](https://img.shields.io/badge/Python-3.13-blue) ![React](https://img.shields.io/badge/React-18-61dafb) ![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)

---

## ✨ Features

- 🔐 **Authentication** — JWT-based signup/login, protected routes
- 💸 **Expense CRUD** — Add, edit, delete income & expenses with categories
- 📊 **Dashboard** — Balance, monthly stats, spending charts, recent transactions
- 🎯 **Budgets** — Set monthly category budgets with alert thresholds
- 📈 **Analytics** — Trend charts, category breakdown, CSV export
- 🌙 **Dark/Light Mode** — Persistent theme toggle
- 💱 **Multi-currency** — INR, USD, EUR, GBP, JPY support

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Recharts, Axios |
| **Backend** | FastAPI, SQLAlchemy (async), Alembic |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | JWT (python-jose), bcrypt |
| **Styling** | Vanilla CSS with CSS custom properties |

---

## 🚀 Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- A free [Supabase](https://supabase.com) account

### 1. Clone the repo
```bash
git clone https://github.com/SamarthNayak99/SpendWise.git
cd SpendWise
```

### 2. Set up the database (Supabase)
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste contents of `backend/supabase_setup.sql` → **Run**
3. Go to **Settings → Database** → copy the **Connection string (URI)**

### 3. Backend setup
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate        # Windows
# source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
```

Create `backend/.env`:
```env
DATABASE_URL=postgresql+asyncpg://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
DATABASE_URL_SYNC=postgresql+psycopg2://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
ALLOWED_ORIGINS=["http://localhost:5173"]
ENV=development
```

> **Note:** If your password contains special characters like `@`, encode them: `@` → `%40`

Start the backend:
```powershell
uvicorn app.main:app --reload --port 8000
```

API docs available at: `http://localhost:8000/docs`

### 4. Frontend setup
```powershell
cd frontend
npm install
npm run dev
```

Open: **http://localhost:5173**

---

## 📁 Project Structure

```
SpendWise/
├── backend/
│   ├── app/
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── routers/         # FastAPI route handlers
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── utils/           # JWT, bcrypt helpers
│   │   ├── dependencies/    # Auth middleware
│   │   ├── database.py      # Async DB engine + session
│   │   ├── config.py        # Pydantic settings
│   │   └── main.py          # FastAPI app entry point
│   ├── alembic/             # DB migrations
│   ├── supabase_setup.sql   # One-click DB setup script
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── api/             # Axios API client + endpoint wrappers
        ├── components/      # Reusable UI components
        ├── context/         # React Context (Auth, Theme)
        ├── pages/           # Dashboard, Expenses, Analytics, etc.
        └── App.jsx
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/signup` | Register new user |
| `POST` | `/auth/login` | Login → JWT token |
| `GET` | `/auth/me` | Get current user |
| `GET/POST` | `/expenses` | List / Create expenses |
| `PUT/DELETE` | `/expenses/{id}` | Update / Delete expense |
| `GET/POST` | `/categories` | List / Create categories |
| `GET/POST` | `/budgets` | List / Create budgets |
| `GET` | `/analytics/dashboard` | Dashboard summary |
| `GET` | `/analytics/trends` | Monthly trends |
| `GET` | `/analytics/category-breakdown` | Spending by category |
| `GET` | `/analytics/export` | Export CSV |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push and open a Pull Request

---

## 📝 License

MIT © [Samarth Nayak](https://github.com/SamarthNayak99)

-- SpendWise: Reset and create all tables from scratch
-- Run this in Supabase SQL Editor → https://supabase.com/dashboard/project/tggwrtdfwdxnflcohsxi/sql/new

-- 1. Drop everything in order (reverse deps)
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS alembic_version CASCADE;
DROP TYPE IF EXISTS expense_type CASCADE;

-- 2. Recreate enum
CREATE TYPE expense_type AS ENUM ('income', 'expense');

-- 3. Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    hashed_password TEXT NOT NULL,
    currency_symbol VARCHAR(5) NOT NULL DEFAULT '₹',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ix_users_email ON users(email);

-- 4. Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL DEFAULT '💰',
    color VARCHAR(7) NOT NULL DEFAULT '#4ade80',
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ix_categories_user_id ON categories(user_id);

-- 5. Expenses table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    type expense_type NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    is_recurring BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ix_expenses_user_id ON expenses(user_id);

-- 6. Budgets table
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    alert_threshold NUMERIC(5,2) NOT NULL DEFAULT 80,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, category_id, month, year)
);
CREATE INDEX ix_budgets_user_id ON budgets(user_id);

-- 7. Alembic version tracking
CREATE TABLE alembic_version (
    version_num VARCHAR(32) NOT NULL PRIMARY KEY
);
INSERT INTO alembic_version VALUES ('0001_initial');

-- 8. Seed default categories (visible to all users, user_id = NULL)
INSERT INTO categories (name, icon, color, is_default) VALUES
    ('Food & Dining',    '🍔', '#f97316', true),
    ('Transport',        '🚗', '#3b82f6', true),
    ('Shopping',         '🛍️', '#a855f7', true),
    ('Entertainment',    '🎮', '#ec4899', true),
    ('Health & Medical', '💊', '#ef4444', true),
    ('Housing & Rent',   '🏠', '#f59e0b', true),
    ('Utilities',        '⚡', '#06b6d4', true),
    ('Education',        '📚', '#8b5cf6', true),
    ('Travel',           '✈️', '#10b981', true),
    ('Salary',           '💼', '#4ade80', true),
    ('Freelance',        '💻', '#22d3ee', true),
    ('Investment',       '📈', '#84cc16', true),
    ('Other',            '💰', '#6b7280', true);

SELECT 'Done! All tables created and seeded.' AS status;

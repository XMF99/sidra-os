-- M11 Department Substrate: 0005_budget_department_ceiling.sql
-- Adds department_id (nullable) to budgets / budget ledger for fourth ceiling

CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY,
    amount REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS budget_ledger (
    id TEXT PRIMARY KEY,
    amount REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

ALTER TABLE budgets ADD COLUMN department_id TEXT REFERENCES departments(id);
ALTER TABLE budget_ledger ADD COLUMN department_id TEXT REFERENCES departments(id);
CREATE INDEX IF NOT EXISTS idx_budgets_department ON budgets(department_id);

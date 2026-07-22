-- M11 Department Substrate: 0006_workorder_engagement_scoping.sql
-- Adds department_id (nullable) to work_orders, engagements, deliverables

CREATE TABLE IF NOT EXISTS work_orders (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS engagements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS deliverables (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

ALTER TABLE work_orders ADD COLUMN department_id TEXT REFERENCES departments(id);
ALTER TABLE engagements ADD COLUMN department_id TEXT REFERENCES departments(id);
ALTER TABLE deliverables ADD COLUMN department_id TEXT REFERENCES departments(id);
CREATE INDEX IF NOT EXISTS idx_work_orders_department ON work_orders(department_id);
CREATE INDEX IF NOT EXISTS idx_engagements_department ON engagements(department_id);

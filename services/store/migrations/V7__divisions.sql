-- M12 Structure: 0007_divisions.sql
-- Creates divisions table and adds division_id to departments table (nullable)

CREATE TABLE IF NOT EXISTS divisions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    executive_agent_id TEXT NOT NULL,
    budget_share REAL NOT NULL DEFAULT 0.125,
    established_at INTEGER NOT NULL DEFAULT (unixepoch())
);

ALTER TABLE departments ADD COLUMN division_id TEXT REFERENCES divisions(id);
CREATE INDEX IF NOT EXISTS idx_departments_division ON departments(division_id);

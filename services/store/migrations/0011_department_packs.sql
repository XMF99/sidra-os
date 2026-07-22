-- M13 Departments: 0011_department_packs.sql
-- Creates department_packs table

CREATE TABLE IF NOT EXISTS department_packs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    division_id TEXT NOT NULL REFERENCES divisions(id),
    signature TEXT NOT NULL,
    manifest_hash TEXT NOT NULL UNIQUE,
    installed_at INTEGER NOT NULL DEFAULT (unixepoch())
);

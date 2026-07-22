-- M13 Departments: 0014_standards_guards.sql
-- Creates standards and guards tables (every Standard MUST carry a guard_id NOT NULL per ADR-0016)

CREATE TABLE IF NOT EXISTS guards (
    guard_id TEXT PRIMARY KEY,
    point TEXT NOT NULL CHECK (point IN ('session_start', 'pre_effect', 'pre_deliverable', 'pre_commit', 'post_turn')),
    action TEXT NOT NULL CHECK (action IN ('warn', 'block')),
    tier TEXT NOT NULL CHECK (tier IN ('declarative', 'wasm', 'kernel'))
);

CREATE TABLE IF NOT EXISTS standards (
    standard_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    path_or_type TEXT NOT NULL,
    guard_id TEXT NOT NULL REFERENCES guards(guard_id) -- NOT NULL constraint echo of ADR-0016
);

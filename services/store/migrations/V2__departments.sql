-- M11 Department Substrate: 0002_departments.sql
-- Creates boundary record tables and seeds the implicit default department (__default__)

CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    division TEXT,
    memory_namespace TEXT,
    capability_ceiling TEXT NOT NULL,
    budget_sub_ceiling_share REAL NOT NULL DEFAULT 1.0,
    budget_sub_ceiling_hard REAL NOT NULL,
    fs_scope TEXT,
    provides_contracts TEXT,
    requires_contracts TEXT,
    pack_ref TEXT,
    state TEXT NOT NULL DEFAULT 'active',
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Seed implicit default department (__default__) per ADR-0040
INSERT OR IGNORE INTO departments (
    id, division, memory_namespace, capability_ceiling,
    budget_sub_ceiling_share, budget_sub_ceiling_hard,
    fs_scope, provides_contracts, requires_contracts, pack_ref, state
) VALUES (
    '__default__', NULL, NULL, '*',
    1.0, 10000.0,
    '', '[]', '[]', NULL, 'active'
);

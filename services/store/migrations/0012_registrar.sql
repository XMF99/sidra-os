-- M13 Departments: 0012_registrar.sql
-- Creates role_archetypes and agent_instances tables

CREATE TABLE IF NOT EXISTS role_archetypes (
    archetype_id TEXT PRIMARY KEY,
    department_id TEXT NOT NULL REFERENCES department_packs(id),
    name TEXT NOT NULL,
    policy TEXT NOT NULL CHECK (policy IN ('eager', 'on_demand', 'scheduled')),
    archetype_version TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agent_instances (
    instance_id TEXT PRIMARY KEY,
    department_id TEXT NOT NULL REFERENCES department_packs(id),
    archetype_id TEXT NOT NULL REFERENCES role_archetypes(archetype_id),
    archetype_version_frozen TEXT NOT NULL,
    instantiated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

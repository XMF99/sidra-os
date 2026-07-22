-- M11 Department Substrate: 0003_agent_department_scoping.sql
-- Adds department_id, archetype_id, archetype_version, instance_number (all nullable) to agents

CREATE TABLE IF NOT EXISTS agents (
    agent_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

ALTER TABLE agents ADD COLUMN department_id TEXT REFERENCES departments(id);
ALTER TABLE agents ADD COLUMN archetype_id TEXT;
ALTER TABLE agents ADD COLUMN archetype_version TEXT;
ALTER TABLE agents ADD COLUMN instance_number INTEGER;

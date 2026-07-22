-- M12 Structure: 0010_division_executives.sql
-- Creates division_executives table with 5-tool CHECK constraint (ADR-0004)

CREATE TABLE IF NOT EXISTS division_executives (
    division_id TEXT NOT NULL REFERENCES divisions(id),
    agent_id TEXT NOT NULL,
    tool_count INTEGER NOT NULL CHECK (tool_count = 5),
    appointed_at INTEGER NOT NULL DEFAULT (unixepoch()),
    PRIMARY KEY (division_id, agent_id)
);

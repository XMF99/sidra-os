-- M12 Structure: 0008_offices.sql
-- Creates offices table (4 Offices: Quality, Cost, Architecture, Security)

CREATE TABLE IF NOT EXISTS offices (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    head_agent_id TEXT NOT NULL,
    veto_scope TEXT NOT NULL CHECK (veto_scope IN ('quality', 'cost', 'architecture', 'security')),
    precedence INTEGER NOT NULL CHECK (precedence BETWEEN 1 AND 4) UNIQUE,
    home_division_id TEXT REFERENCES divisions(id),
    established_at INTEGER NOT NULL DEFAULT (unixepoch())
);

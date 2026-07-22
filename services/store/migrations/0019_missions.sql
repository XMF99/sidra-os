-- M15 Mission Engine: 0019_missions.sql
-- Projections for missions and mission_plans (ARCH §20.2)

CREATE TABLE IF NOT EXISTS missions (
    mission_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    current_state TEXT NOT NULL,
    current_plan_version INTEGER NOT NULL DEFAULT 1,
    risk_band TEXT NOT NULL DEFAULT 'Low',
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS mission_plans (
    mission_id TEXT NOT NULL,
    version INTEGER NOT NULL,
    rationale TEXT NOT NULL,
    superseded_by INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    PRIMARY KEY (mission_id, version),
    FOREIGN KEY (mission_id) REFERENCES missions(mission_id)
);

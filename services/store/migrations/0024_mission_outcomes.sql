-- M15 Mission Engine: 0024_mission_outcomes.sql
-- Projections for mission_outcomes and additive fields (ARCH §20.2, §20.3)

CREATE TABLE IF NOT EXISTS mission_outcomes (
    mission_id TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    total_cost REAL NOT NULL,
    total_duration INTEGER NOT NULL,
    concluded_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (mission_id) REFERENCES missions(mission_id)
);

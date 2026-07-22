-- M15 Mission Engine: 0020_mission_objectives.sql
-- Projections for mission_objectives (ARCH §20.2)

CREATE TABLE IF NOT EXISTS mission_objectives (
    objective_id TEXT PRIMARY KEY,
    mission_id TEXT NOT NULL,
    plan_version INTEGER NOT NULL,
    statement TEXT NOT NULL,
    kind TEXT NOT NULL,
    weight REAL NOT NULL,
    falsifiable INTEGER NOT NULL CHECK (falsifiable IN (0, 1)),
    status TEXT NOT NULL DEFAULT 'unmet',
    FOREIGN KEY (mission_id, plan_version) REFERENCES mission_plans(mission_id, version)
);

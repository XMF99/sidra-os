-- M15 Mission Engine: 0022_mission_evidence.sql
-- Projections for mission_evidence (ARCH §20.2)

CREATE TABLE IF NOT EXISTS mission_evidence (
    evidence_id TEXT PRIMARY KEY,
    mission_id TEXT NOT NULL,
    objective_id TEXT NOT NULL,
    method TEXT NOT NULL,
    artifact_hash TEXT NOT NULL,
    verifier TEXT NOT NULL,
    verdict TEXT NOT NULL,
    recorded_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (mission_id) REFERENCES missions(mission_id),
    FOREIGN KEY (objective_id) REFERENCES mission_objectives(objective_id)
);

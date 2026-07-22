-- Migration 0064: Procedure Observations Table for M28 Procedural Compilation
-- Stores off-hot-path observations of procedure signatures from concluded Missions.
-- UNIQUE(signature_hash, mission_id) ensures a single Mission replayed/retried counts ONCE.

CREATE TABLE IF NOT EXISTS procedure_observations (
    observation_id TEXT PRIMARY KEY NOT NULL,
    mission_id TEXT NOT NULL,
    engagement_id TEXT NOT NULL,
    signature_hash TEXT NOT NULL,
    departments_json TEXT NOT NULL,
    capabilities_json TEXT NOT NULL,
    observed_at INTEGER NOT NULL,
    UNIQUE(signature_hash, mission_id)
);

CREATE INDEX IF NOT EXISTS idx_procedure_observations_sig ON procedure_observations(signature_hash);
CREATE INDEX IF NOT EXISTS idx_procedure_observations_mission ON procedure_observations(mission_id);

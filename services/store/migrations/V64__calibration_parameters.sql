-- Migration 0057: Calibration Parameters Table for M26 Outcome Calibration
-- Stores versioned calibration parameter sets.
-- Seeds Version 0 (the identity parameters) so active_parameters() is defined from first boot.

CREATE TABLE IF NOT EXISTS calibration_parameters (
    version INTEGER PRIMARY KEY NOT NULL,
    supersedes_version INTEGER,
    active BOOLEAN NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_calibration_parameters_active ON calibration_parameters(active);

-- Seed Version 0 (Identity Parameters)
INSERT INTO calibration_parameters (version, supersedes_version, active, created_at)
VALUES (0, NULL, 1, 1700000000)
ON CONFLICT(version) DO NOTHING;

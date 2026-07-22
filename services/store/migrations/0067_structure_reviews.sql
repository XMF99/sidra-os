-- Migration 0067: Structure Reviews Table for M29 Firm Self-Review
-- Stores quarterly structure review runs over installed departments.

CREATE TABLE IF NOT EXISTS structure_reviews (
    review_id TEXT PRIMARY KEY NOT NULL,
    quarter TEXT NOT NULL,
    status TEXT NOT NULL, -- SCHEDULED, GATHERING_METRICS, ASSESSING, ABSORBABILITY_APPLIED, PROPOSALS_EMITTED, CONCLUDED
    departments_assessed INTEGER NOT NULL,
    overall_confidence REAL NOT NULL,
    started_at INTEGER NOT NULL,
    concluded_at INTEGER,
    run_by TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_structure_reviews_quarter ON structure_reviews(quarter);

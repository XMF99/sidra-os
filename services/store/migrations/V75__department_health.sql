-- Migration 0068: Department Health Table for M29 Firm Self-Review
-- Stores per-department overhead against deliverable quality and absorbability verdicts.
-- evidence_refs_json NOT NULL guarantees no health line is emitted without measured evidence (ADR-0077).

CREATE TABLE IF NOT EXISTS department_health (
    health_id TEXT PRIMARY KEY NOT NULL,
    review_id TEXT NOT NULL REFERENCES structure_reviews(review_id),
    department_id TEXT NOT NULL,
    overhead_score REAL NOT NULL,
    measured_quality REAL NOT NULL,
    earned_overhead BOOLEAN NOT NULL,
    absorbable_verdict TEXT NOT NULL, -- ABSORBABLE, NOT_ABSORBABLE, INSUFFICIENT_EVIDENCE
    candidate_absorber TEXT,
    quality_drop REAL NOT NULL,
    evidence_refs_json TEXT NOT NULL, -- JSON array of evidence references
    confidence REAL NOT NULL,
    assessed_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_department_health_review ON department_health(review_id);
CREATE INDEX IF NOT EXISTS idx_department_health_dept ON department_health(department_id);

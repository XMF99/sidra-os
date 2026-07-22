-- Migration 0069: Structure Proposals Table for M29 Firm Self-Review
-- Stores inert Merge / Retire proposals raised by quarterly self-reviews.
-- decision_id is a nullable FK pointing AT a Decision (set only by observing one, never by enacting).

CREATE TABLE IF NOT EXISTS structure_proposals (
    proposal_id TEXT PRIMARY KEY NOT NULL,
    review_id TEXT NOT NULL REFERENCES structure_reviews(review_id),
    department_id TEXT NOT NULL,
    kind TEXT NOT NULL, -- MERGE, RETIRE
    target_department TEXT, -- Absorption target for MERGE
    rationale TEXT NOT NULL,
    evidence_refs_json TEXT NOT NULL, -- JSON array of evidence references
    confidence REAL NOT NULL,
    resolution TEXT NOT NULL, -- OPEN, ENACTED_BY_PRINCIPAL, DECLINED
    decision_id TEXT, -- FK to decisions table (nullable)
    proposed_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_structure_proposals_review ON structure_proposals(review_id);
CREATE INDEX IF NOT EXISTS idx_structure_proposals_resolution ON structure_proposals(resolution);

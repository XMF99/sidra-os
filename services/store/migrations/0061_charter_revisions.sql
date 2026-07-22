-- Migration 0061: Charter Revisions and Provenance Tables for M27 Charter Evolution
-- Stores proposed archetype charter revisions, their status, refusal reasons, Decision link, and provenance.

CREATE TABLE IF NOT EXISTS charter_revisions (
    revision_id TEXT PRIMARY KEY NOT NULL,
    archetype_id TEXT NOT NULL,
    base_version INTEGER NOT NULL,
    proposed_charter_json TEXT NOT NULL,
    relation_to_base TEXT, -- SAME, NARROWER, WIDER, INCOMPARABLE
    status TEXT NOT NULL, -- PROPOSED, EVALUATING, REFUSED, AWAITING_PRINCIPAL, CONFIRMED, REJECTED
    refuse_reason TEXT, -- EVAL_REGRESSION, NO_EVALUATION_SET, WRONG_ARCHETYPE, WIDENING, NO_PROVENANCE
    decision_id TEXT,
    proposed_by TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_charter_revisions_archetype ON charter_revisions(archetype_id, base_version);
CREATE INDEX IF NOT EXISTS idx_charter_revisions_status ON charter_revisions(status);

CREATE TABLE IF NOT EXISTS charter_revision_provenance (
    provenance_id TEXT PRIMARY KEY NOT NULL,
    revision_id TEXT NOT NULL REFERENCES charter_revisions(revision_id),
    archetype_id TEXT NOT NULL,
    outcome_ref TEXT,
    kpi_ref TEXT,
    rationale TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_charter_revision_provenance_rev ON charter_revision_provenance(revision_id);

-- M22 Delegation and Separation of Duties: 0047_delegations.sql
-- Ref: DELEGATION_AND_SEPARATION_ARCHITECTURE.md §7.1, ADR-0061

CREATE TABLE IF NOT EXISTS delegations (
  id            TEXT PRIMARY KEY NOT NULL,
  delegator_id  TEXT NOT NULL REFERENCES seats(id),
  delegatee_id  TEXT NOT NULL REFERENCES seats(id),
  scope         TEXT NOT NULL,
  granted_at    INTEGER NOT NULL,
  expires_at    INTEGER NOT NULL,
  granted_by    TEXT NOT NULL REFERENCES seats(id),
  decision_id   TEXT NOT NULL,
  revoked_at    INTEGER,
  revoked_by    TEXT REFERENCES seats(id),
  CHECK (delegatee_id <> delegator_id),
  CHECK (expires_at > granted_at)
);

CREATE INDEX IF NOT EXISTS idx_delegations_delegatee ON delegations(delegatee_id) WHERE revoked_at IS NULL;

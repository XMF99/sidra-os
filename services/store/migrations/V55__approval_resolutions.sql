-- M22 Delegation and Separation of Duties: 0048_approval_resolutions.sql
-- Ref: DELEGATION_AND_SEPARATION_ARCHITECTURE.md §7.1, ADR-0060

ALTER TABLE approval_requests ADD COLUMN requester_seat_id TEXT REFERENCES seats(id);

CREATE TABLE IF NOT EXISTS approval_resolutions (
  id                TEXT PRIMARY KEY NOT NULL,
  request_id        TEXT NOT NULL UNIQUE REFERENCES approval_requests(id),
  approver_seat_id  TEXT NOT NULL REFERENCES seats(id),
  authority_source  TEXT NOT NULL CHECK (authority_source IN ('own_fence','delegation')),
  delegation_id     TEXT REFERENCES delegations(id),
  verdict           TEXT NOT NULL CHECK (verdict IN ('granted','denied')),
  decision_id       TEXT NOT NULL,
  created_at        INTEGER NOT NULL,
  CHECK (approver_seat_id <> (SELECT requester_seat_id FROM approval_requests WHERE approval_requests.id = approval_resolutions.request_id)),
  CHECK ((authority_source = 'delegation') = (delegation_id IS NOT NULL))
);

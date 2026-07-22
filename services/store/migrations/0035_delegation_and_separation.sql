-- M22 Delegation and Separation of Duties: 0035_delegation_and_separation.sql
-- Additive projections for seat delegations and self-approval refusal checks

CREATE TABLE IF NOT EXISTS seat_delegations (
    delegation_id TEXT PRIMARY KEY NOT NULL,
    delegator_seat_id TEXT NOT NULL REFERENCES seats(seat_id),
    delegatee_seat_id TEXT NOT NULL REFERENCES seats(seat_id),
    granted_capabilities_json TEXT NOT NULL,
    granted_at INTEGER NOT NULL DEFAULT (unixepoch()),
    expires_at INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'revoked', 'expired')) DEFAULT 'active',
    CHECK (delegatee_seat_id <> delegator_seat_id),
    CHECK (expires_at > granted_at)
);

CREATE TABLE IF NOT EXISTS approval_resolutions (
    resolution_id TEXT PRIMARY KEY NOT NULL,
    approval_request_id TEXT NOT NULL REFERENCES approval_requests(id),
    approver_seat_id TEXT NOT NULL REFERENCES seats(seat_id),
    verdict TEXT NOT NULL CHECK (verdict IN ('approved', 'rejected')),
    resolved_at INTEGER NOT NULL DEFAULT (unixepoch())
    -- Structural refusal: approver_seat_id cannot be the requester_seat_id of the approval_request
);

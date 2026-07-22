-- Migration 0049: Client Enrollments Table for M23 Kernel Extraction
-- Stores durable metadata for client enrollment bound to Seats.
-- Holds zero secrets or credentials (credential_ref points to OS keychain).

CREATE TABLE IF NOT EXISTS client_enrollments (
    client_id TEXT PRIMARY KEY NOT NULL,
    seat_id TEXT NOT NULL,
    credential_ref TEXT NOT NULL,
    enrolled_at INTEGER NOT NULL,
    revoked_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_client_enrollments_seat ON client_enrollments(seat_id);
CREATE INDEX IF NOT EXISTS idx_client_enrollments_active ON client_enrollments(client_id) WHERE revoked_at IS NULL;

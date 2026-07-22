-- M21 Seats and Identity: 0042_seats.sql
-- Ref: SEATS_AND_IDENTITY_ARCHITECTURE.md §11.1, ADR-0057

CREATE TABLE IF NOT EXISTS seats (
    id TEXT PRIMARY KEY NOT NULL,
    actor_value TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('invited', 'created', 'active', 'suspended', 'retired')),
    is_founding INTEGER NOT NULL DEFAULT 0,
    invited_by TEXT REFERENCES seats(id),
    created_at INTEGER NOT NULL,
    retired_at INTEGER
);

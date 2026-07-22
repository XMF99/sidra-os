-- M21 Seats and Identity: 0043_seat_fences.sql
-- Ref: SEATS_AND_IDENTITY_ARCHITECTURE.md §11.1, ADR-0058

CREATE TABLE IF NOT EXISTS seat_fences (
    seat_id TEXT PRIMARY KEY NOT NULL REFERENCES seats(id),
    capabilities_json TEXT NOT NULL,
    set_by TEXT NOT NULL,
    set_at INTEGER NOT NULL,
    active INTEGER NOT NULL DEFAULT 1
);

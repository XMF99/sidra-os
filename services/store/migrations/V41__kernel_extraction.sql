-- M23 Kernel Extraction: 0036_kernel_extraction.sql
-- Additive projections for hosted kernel sessions and rpc client connections

CREATE TABLE IF NOT EXISTS kernel_sessions (
    session_id TEXT PRIMARY KEY NOT NULL,
    seat_id TEXT NOT NULL REFERENCES seats(seat_id),
    client_type TEXT NOT NULL CHECK (client_type IN ('desktop', 'companion', 'cli', 'sdk')),
    established_at INTEGER NOT NULL DEFAULT (unixepoch()),
    last_active_at INTEGER NOT NULL DEFAULT (unixepoch()),
    status TEXT NOT NULL CHECK (status IN ('active', 'closed', 'expired')) DEFAULT 'active'
);

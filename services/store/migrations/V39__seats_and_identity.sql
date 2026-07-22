-- M21 Seats and Identity: 0034_seats_and_identity.sql
-- Additive projections for human seats, per-seat capability fences, and budgets

CREATE TABLE IF NOT EXISTS seats (
    seat_id TEXT PRIMARY KEY NOT NULL,
    actor_value TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('invited', 'active', 'retired')) DEFAULT 'active',
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS seat_fences (
    seat_id TEXT PRIMARY KEY NOT NULL REFERENCES seats(seat_id),
    capabilities_json TEXT NOT NULL,
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS seat_budgets (
    seat_id TEXT PRIMARY KEY NOT NULL REFERENCES seats(seat_id),
    monthly_ceiling_cents INTEGER NOT NULL,
    current_spend_cents INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS seat_working_memory (
    seat_id TEXT PRIMARY KEY NOT NULL REFERENCES seats(seat_id),
    namespace_prefix TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'sealed')) DEFAULT 'active'
);

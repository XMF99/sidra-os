-- M21 Seats and Identity: 0045_seat_working_memory.sql
-- Ref: SEATS_AND_IDENTITY_ARCHITECTURE.md §11.1, ADR-0059

CREATE TABLE IF NOT EXISTS seat_working_memory (
    seat_id TEXT PRIMARY KEY NOT NULL REFERENCES seats(id),
    namespace TEXT UNIQUE NOT NULL,
    sealed INTEGER NOT NULL DEFAULT 0
);

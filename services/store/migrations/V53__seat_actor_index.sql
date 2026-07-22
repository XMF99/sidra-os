-- M21 Seats and Identity: 0046_seat_actor_index.sql
-- Ref: SEATS_AND_IDENTITY_ARCHITECTURE.md §11.1, ADR-0057
-- Additive covering index for read-time attribution join (events.actor) without modifying columns or rewriting rows.

CREATE INDEX IF NOT EXISTS idx_events_actor ON events (actor, seq);

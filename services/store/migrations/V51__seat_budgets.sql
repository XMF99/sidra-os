-- M21 Seats and Identity: 0044_seat_budgets.sql
-- Ref: SEATS_AND_IDENTITY_ARCHITECTURE.md §11.1, ADR-0058

CREATE TABLE IF NOT EXISTS seat_budgets (
    seat_id TEXT NOT NULL REFERENCES seats(id),
    period TEXT NOT NULL,
    ceiling_cents INTEGER NOT NULL,
    spent_cents INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (seat_id, period)
);

//! M21 Seats and Identity — Seat Budget Aggregate
//! Ref: SEATS_AND_IDENTITY_ARCHITECTURE.md §4.4, ADR-0058, ADR-0020

use super::values::SeatId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SeatBudget {
    pub seat_id: SeatId,
    pub period: String, // e.g. "2026-07"
    pub ceiling_cents: i64,
    pub spent_cents: i64,
}

impl SeatBudget {
    pub fn new(seat_id: SeatId, period: impl Into<String>, ceiling_cents: i64) -> Self {
        Self {
            seat_id,
            period: period.into(),
            ceiling_cents,
            spent_cents: 0,
        }
    }

    pub fn is_exhausted(&self) -> bool {
        self.spent_cents >= self.ceiling_cents
    }

    pub fn remaining_cents(&self) -> i64 {
        (self.ceiling_cents - self.spent_cents).max(0)
    }

    pub fn debit(&mut self, cents: i64) -> Result<(), String> {
        if cents < 0 {
            return Err("Cannot debit negative cents".to_string());
        }
        self.spent_cents += cents;
        Ok(())
    }
}

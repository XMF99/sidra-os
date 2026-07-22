//! M21 Seats and Identity — Budget Engine
//! Ref: SEATS_AND_IDENTITY_ARCHITECTURE.md §9, ADR-0058, ADR-0020

use crate::domain::SeatBudget;

pub struct SeatBudgetEngine;

impl SeatBudgetEngine {
    /// Debit spend attributed to originating Seat
    pub fn debit_spend(budget: &mut SeatBudget, cents: i64) -> Result<(), String> {
        budget.debit(cents)?;
        if budget.is_exhausted() {
            return Err(format!(
                "BudgetExhausted: Seat '{}' originated work exhausted budget ceiling of {} cents (ADR-0058)",
                budget.seat_id.0, budget.ceiling_cents
            ));
        }
        Ok(())
    }
}

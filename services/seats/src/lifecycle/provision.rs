//! M21 Seats and Identity — Seat Provisioning
//! Ref: SEATS_AND_IDENTITY_ARCHITECTURE.md §3.2, ADR-0058, ADR-0059

use std::collections::BTreeSet;
use crate::domain::{Capability, SeatBudget, SeatFence, SeatId, SeatWorkingMemory};
use crate::registry::SeatRegistry;

pub fn provision_seat(
    registry: &mut SeatRegistry,
    seat_id: &SeatId,
    requested_capabilities: BTreeSet<Capability>,
    admitting_fence: &SeatFence,
    budget_ceiling_cents: i64,
    firm_month_ceiling: i64,
    existing_seats_budget_sum: i64,
    now: u64,
) -> Result<(SeatFence, SeatBudget, SeatWorkingMemory), String> {
    let seat = registry
        .get_mut_by_id(seat_id)
        .ok_or_else(|| format!("Seat '{}' not found", seat_id.0))?;

    seat.provision()?;

    // 1. Create Fence ⊆ admitting authority (ADR-0058)
    let fence = SeatFence::new_subset_of_admitting(
        seat_id.clone(),
        requested_capabilities,
        admitting_fence,
        seat.actor_value.clone(),
        now,
    )?;

    // 2. Validate Budget nesting Σ ceilings ≤ firm month (ADR-0058, ADR-0020)
    if existing_seats_budget_sum + budget_ceiling_cents > firm_month_ceiling {
        let remaining = firm_month_ceiling - existing_seats_budget_sum;
        return Err(format!(
            "BudgetViolation: Requested ceiling {} cents exceeds remaining firm month headroom {} cents (ADR-0058)",
            budget_ceiling_cents, remaining
        ));
    }

    let budget = SeatBudget::new(seat_id.clone(), "2026-07", budget_ceiling_cents);

    // 3. Provision memory namespace `seat/<id>` (ADR-0059)
    let memory = SeatWorkingMemory::provision(seat_id.clone());

    Ok((fence, budget, memory))
}

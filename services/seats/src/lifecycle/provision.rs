//! M21 Seats and Identity — Seat Provisioning
//! Ref: SEATS_AND_IDENTITY_ARCHITECTURE.md §3.2, ADR-0058, ADR-0059

use crate::domain::{Capability, SeatBudget, SeatFence, SeatId, SeatWorkingMemory};
use crate::registry::SeatRegistry;
use std::collections::BTreeSet;

pub struct ProvisionSeatArgs<'a> {
    pub registry: &'a mut SeatRegistry,
    pub seat_id: &'a SeatId,
    pub requested_capabilities: BTreeSet<Capability>,
    pub admitting_fence: &'a SeatFence,
    pub budget_ceiling_cents: i64,
    pub firm_month_ceiling: i64,
    pub existing_seats_budget_sum: i64,
    pub now: u64,
}

pub fn provision_seat(
    args: ProvisionSeatArgs<'_>,
) -> Result<(SeatFence, SeatBudget, SeatWorkingMemory), String> {
    let seat = args
        .registry
        .get_mut_by_id(args.seat_id)
        .ok_or_else(|| format!("Seat '{}' not found", args.seat_id.0))?;

    seat.provision()?;

    // 1. Create Fence ⊆ admitting authority (ADR-0058)
    let fence = SeatFence::new_subset_of_admitting(
        args.seat_id.clone(),
        args.requested_capabilities,
        args.admitting_fence,
        seat.actor_value.clone(),
        args.now,
    )?;

    // 2. Validate Budget nesting Σ ceilings ≤ firm month (ADR-0058, ADR-0020)
    if args.existing_seats_budget_sum + args.budget_ceiling_cents > args.firm_month_ceiling {
        let remaining = args.firm_month_ceiling - args.existing_seats_budget_sum;
        return Err(format!(
            "BudgetViolation: Requested ceiling {} cents exceeds remaining firm month headroom {} cents (ADR-0058)",
            args.budget_ceiling_cents, remaining
        ));
    }

    let budget = SeatBudget::new(args.seat_id.clone(), "2026-07", args.budget_ceiling_cents);

    // 3. Provision memory namespace `seat/<id>` (ADR-0059)
    let memory = SeatWorkingMemory::provision(args.seat_id.clone());

    Ok((fence, budget, memory))
}

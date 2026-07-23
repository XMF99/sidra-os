//! M21 Seats and Identity — Fence Enforcement Engine
//! Ref: SEATS_AND_IDENTITY_ARCHITECTURE.md §8, ADR-0058

use crate::domain::{Capability, SeatFence};
use std::collections::BTreeSet;

pub struct SeatFenceEngine;

impl SeatFenceEngine {
    /// Compute effective capabilities: charter ∩ work_order_grant ∩ firm_policy ∩ session_grants ∩ seat_fence
    pub fn compute_effective(
        firm_policy: &BTreeSet<Capability>,
        seat_fence: &SeatFence,
    ) -> BTreeSet<Capability> {
        seat_fence.intersect_with_policy(firm_policy)
    }

    /// Check if a capability is permitted by the Seat Fence
    pub fn is_permitted(seat_fence: &SeatFence, cap: &Capability) -> bool {
        if !seat_fence.active {
            return false;
        }
        seat_fence.capabilities.contains(cap) || seat_fence.capabilities.iter().any(|c| c.0 == "*")
    }
}

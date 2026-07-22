//! M21 Seats and Identity — Seat Fence Aggregate
//! Ref: SEATS_AND_IDENTITY_ARCHITECTURE.md §4.3, ADR-0058

use serde::{Deserialize, Serialize};
use std::collections::BTreeSet;
use super::values::{ActorValue, SeatId};

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, PartialOrd, Ord)]
pub struct Capability(pub String);

impl Capability {
    pub fn parse(cap_str: &str) -> Result<Self, String> {
        if cap_str == "*" {
            return Ok(Self(cap_str.to_string()));
        }
        let parts: Vec<&str> = cap_str.split('.').collect();
        if parts.len() < 2 || parts[0].is_empty() || parts[1].is_empty() {
            return Err(format!("Invalid capability syntax '{}'", cap_str));
        }
        Ok(Self(cap_str.to_string()))
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SeatFence {
    pub seat_id: SeatId,
    pub capabilities: BTreeSet<Capability>, // Default-deny: empty = can do nothing
    pub set_by: ActorValue,
    pub set_at: u64,
    pub active: bool,
}

impl SeatFence {
    pub fn empty(seat_id: SeatId, set_by: ActorValue, now: u64) -> Self {
        Self {
            seat_id,
            capabilities: BTreeSet::new(),
            set_by,
            set_at: now,
            active: true,
        }
    }

    pub fn new_subset_of_admitting(
        seat_id: SeatId,
        requested_capabilities: BTreeSet<Capability>,
        admitting_seat_fence: &SeatFence,
        set_by: ActorValue,
        now: u64,
    ) -> Result<Self, String> {
        // Assert requested_capabilities ⊆ admitting_seat_fence (no self-widen ADR-0058)
        for cap in &requested_capabilities {
            if !admitting_seat_fence.capabilities.contains(cap) && !admitting_seat_fence.capabilities.iter().any(|c| c.0 == "*") {
                return Err(format!(
                    "FenceViolation: Cannot grant capability '{}' not held by admitting authority (ADR-0058)",
                    cap.0
                ));
            }
        }

        Ok(Self {
            seat_id,
            capabilities: requested_capabilities,
            set_by,
            set_at: now,
            active: true,
        })
    }

    /// Compute effective capability intersection with firm policy
    pub fn intersect_with_policy(&self, firm_policy: &BTreeSet<Capability>) -> BTreeSet<Capability> {
        if !self.active {
            return BTreeSet::new(); // Inactive/Suspended Fence permits nothing
        }
        self.capabilities
            .intersection(firm_policy)
            .cloned()
            .collect()
    }
}

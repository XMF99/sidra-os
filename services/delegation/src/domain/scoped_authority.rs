//! M22 Delegation and Separation of Duties — Scoped Authority View
//! Ref: DELEGATION_AND_SEPARATION_ARCHITECTURE.md §4.3, ADR-0061

use super::delegation::Delegation;
use serde::{Deserialize, Serialize};
use sidra_seats::{Capability, SeatFence, SeatId};
use std::collections::BTreeSet;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScopedAuthority {
    pub seat_id: SeatId,
    pub own_capabilities: BTreeSet<Capability>,
    pub delegated_capabilities: BTreeSet<Capability>,
}

impl ScopedAuthority {
    pub fn compute(
        seat_id: &SeatId,
        own_fence: &SeatFence,
        active_delegations: &[(Delegation, SeatFence)],
        now: u64,
    ) -> Self {
        let own_caps = if own_fence.active {
            own_fence.capabilities.clone()
        } else {
            BTreeSet::new()
        };

        let mut delegated_caps = BTreeSet::new();

        for (delegation, delegator_fence) in active_delegations {
            if delegation.is_active(now) && delegator_fence.active {
                // Use-time re-check: scope ∩ delegator's current Fence (ADR-0061)
                let effective_scope = delegation.scope.intersect(&delegator_fence.capabilities);
                delegated_caps.extend(effective_scope.capabilities);
            }
        }

        Self {
            seat_id: seat_id.clone(),
            own_capabilities: own_caps,
            delegated_capabilities: delegated_caps,
        }
    }

    pub fn effective_capabilities(&self) -> BTreeSet<Capability> {
        let mut caps = self.own_capabilities.clone();
        caps.extend(self.delegated_capabilities.clone());
        caps
    }

    pub fn holds_capability(&self, cap: &Capability) -> bool {
        let effective = self.effective_capabilities();
        effective.contains(cap) || effective.iter().any(|c| c.0 == "*")
    }
}

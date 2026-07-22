//! M22 Delegation and Separation of Duties — Delegation Engine
//! Ref: DELEGATION_AND_SEPARATION_ARCHITECTURE.md §3, §5, ADR-0061

use std::collections::HashMap;
use sidra_seats::{Capability, SeatFence, SeatId};
use crate::domain::{Delegation, DenyReason, Scope, ScopedAuthority};

#[derive(Default)]
pub struct DelegationEngine {
    delegations: HashMap<String, Delegation>,
}

impl DelegationEngine {
    pub fn new() -> Self {
        Self::default()
    }

    /// Grant a delegation: checks scope ⊆ delegator Fence (ADR-0061)
    pub fn delegate_authority(
        &mut self,
        delegator: SeatId,
        delegatee: SeatId,
        scope: Scope,
        delegator_fence: &SeatFence,
        granted_at: u64,
        expires_at: u64,
        decision_id: impl Into<String>,
    ) -> Result<Delegation, DenyReason> {
        // 1. Check self-delegation
        if delegator == delegatee {
            return Err(DenyReason::SelfDelegation);
        }

        // 2. Check scope ⊆ delegator's current Fence (ADR-0061, default deny)
        if !scope.is_subset_of(&delegator_fence.capabilities) {
            for cap in &scope.capabilities {
                if !delegator_fence.capabilities.contains(cap) && !delegator_fence.capabilities.iter().any(|c| c.0 == "*") {
                    return Err(DenyReason::ScopeExceedsFence(cap.0.clone()));
                }
            }
        }

        // 3. Create delegation aggregate
        let delegation = Delegation::create(
            delegator.clone(),
            delegatee,
            scope,
            granted_at,
            expires_at,
            delegator,
            decision_id.into(),
        ).map_err(|_| DenyReason::SelfDelegation)?;

        self.delegations.insert(delegation.id.0.clone(), delegation.clone());
        Ok(delegation)
    }

    pub fn revoke_delegation(
        &mut self,
        delegation_id: &str,
        revoked_by: SeatId,
        now: u64,
    ) -> Result<(), String> {
        let delegation = self
            .delegations
            .get_mut(delegation_id)
            .ok_or_else(|| format!("Delegation '{}' not found", delegation_id))?;
        delegation.revoke(revoked_by, now)
    }

    pub fn get_active_delegations_to(
        &self,
        delegatee: &SeatId,
        now: u64,
    ) -> Vec<Delegation> {
        self.delegations
            .values()
            .filter(|d| &d.delegatee == delegatee && d.is_active(now))
            .cloned()
            .collect()
    }
}

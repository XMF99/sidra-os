//! M22 Delegation and Separation of Duties — Delegation Engine
//! Ref: DELEGATION_AND_SEPARATION_ARCHITECTURE.md §3, §5, ADR-0061

use crate::domain::{Delegation, DenyReason, Scope};
use sidra_seats::{SeatFence, SeatId};
use std::collections::HashMap;

#[derive(Default)]
pub struct DelegationEngine {
    delegations: HashMap<String, Delegation>,
}

pub struct DelegateAuthorityArgs<'a> {
    pub delegator: SeatId,
    pub delegatee: SeatId,
    pub scope: Scope,
    pub delegator_fence: &'a SeatFence,
    pub granted_at: u64,
    pub expires_at: u64,
    pub decision_id: String,
}

impl DelegationEngine {
    pub fn new() -> Self {
        Self::default()
    }

    /// Grant a delegation: checks scope ⊆ delegator Fence (ADR-0061)
    pub fn delegate_authority(
        &mut self,
        args: DelegateAuthorityArgs<'_>,
    ) -> Result<Delegation, DenyReason> {
        // 1. Check self-delegation
        if args.delegator == args.delegatee {
            return Err(DenyReason::SelfDelegation);
        }

        // 2. Check scope ⊆ delegator's current Fence (ADR-0061, default deny)
        if !args.scope.is_subset_of(&args.delegator_fence.capabilities) {
            for cap in &args.scope.capabilities {
                if !args.delegator_fence.capabilities.contains(cap)
                    && !args.delegator_fence.capabilities.iter().any(|c| c.0 == "*")
                {
                    return Err(DenyReason::ScopeExceedsFence(cap.0.clone()));
                }
            }
        }

        // 3. Create delegation aggregate
        let delegation = Delegation::create(
            args.delegator.clone(),
            args.delegatee,
            args.scope,
            args.granted_at,
            args.expires_at,
            args.delegator,
            args.decision_id,
        )
        .map_err(|_| DenyReason::SelfDelegation)?;

        self.delegations
            .insert(delegation.id.0.clone(), delegation.clone());
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

    pub fn get_active_delegations_to(&self, delegatee: &SeatId, now: u64) -> Vec<Delegation> {
        self.delegations
            .values()
            .filter(|d| &d.delegatee == delegatee && d.is_active(now))
            .cloned()
            .collect()
    }
}

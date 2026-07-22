//! M22 Delegation and Separation of Duties — Delegation Aggregate
//! Ref: DELEGATION_AND_SEPARATION_ARCHITECTURE.md §4.2, ADR-0061

use serde::{Deserialize, Serialize};
use sidra_seats::SeatId;
use super::values::{DelegationId, Scope};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Delegation {
    pub id: DelegationId,
    pub delegator: SeatId,
    pub delegatee: SeatId, // REQUIRED and != delegator (ADR-0061)
    pub scope: Scope,      // ⊆ delegator's Fence at grant; re-checked at use
    pub granted_at: u64,
    pub expires_at: u64,    // REQUIRED, strictly after granted_at
    pub granted_by: SeatId,
    pub decision_id: String,
    pub revoked_at: Option<u64>,
    pub revoked_by: Option<SeatId>,
}

impl Delegation {
    pub fn create(
        delegator: SeatId,
        delegatee: SeatId,
        scope: Scope,
        granted_at: u64,
        expires_at: u64,
        granted_by: SeatId,
        decision_id: String,
    ) -> Result<Self, String> {
        if delegator == delegatee {
            return Err("SelfDelegationViolation: A Seat cannot delegate to itself (ADR-0061)".to_string());
        }
        if expires_at <= granted_at {
            return Err("InvalidWindowViolation: Delegation expires_at must be strictly after granted_at".to_string());
        }

        Ok(Self {
            id: DelegationId::generate(),
            delegator,
            delegatee,
            scope,
            granted_at,
            expires_at,
            granted_by,
            decision_id,
            revoked_at: None,
            revoked_by: None,
        })
    }

    pub fn is_active(&self, now: u64) -> bool {
        self.revoked_at.is_none() && now < self.expires_at
    }

    pub fn revoke(&mut self, revoked_by: SeatId, now: u64) -> Result<(), String> {
        if self.revoked_at.is_some() {
            return Err("Delegation is already revoked".to_string());
        }
        self.revoked_at = Some(now);
        self.revoked_by = Some(revoked_by);
        Ok(())
    }
}

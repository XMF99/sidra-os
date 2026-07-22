//! M22 Delegation and Separation of Duties — Approval Resolution Aggregate
//! Ref: DELEGATION_AND_SEPARATION_ARCHITECTURE.md §4.4, ADR-0060

use serde::{Deserialize, Serialize};
use sidra_seats::SeatId;
use super::values::DelegationId;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum AuthoritySource {
    OwnFence,
    Delegation,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ApprovalVerdict {
    Granted,
    Denied,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApprovalResolution {
    pub id: String,
    pub request_id: String,
    pub requester_seat_id: SeatId,
    pub approver_seat_id: SeatId, // CHECK approver_seat_id <> requester_seat_id (ADR-0060)
    pub authority_source: AuthoritySource,
    pub delegation_id: Option<DelegationId>,
    pub verdict: ApprovalVerdict,
    pub decision_id: String,
    pub created_at: u64,
}

impl ApprovalResolution {
    pub fn create(
        request_id: impl Into<String>,
        requester_seat_id: SeatId,
        approver_seat_id: SeatId,
        authority_source: AuthoritySource,
        delegation_id: Option<DelegationId>,
        verdict: ApprovalVerdict,
        decision_id: impl Into<String>,
        now: u64,
    ) -> Result<Self, String> {
        if approver_seat_id == requester_seat_id {
            return Err("SelfApprovalViolation: A Seat cannot resolve its own Approval Request (ADR-0060)".to_string());
        }

        if authority_source == AuthoritySource::Delegation && delegation_id.is_none() {
            return Err("DelegationSourceViolation: Delegation authority source requires delegation_id".to_string());
        }

        Ok(Self {
            id: format!("res_{}", ulid::Ulid::new().to_string().to_lowercase()),
            request_id: request_id.into(),
            requester_seat_id,
            approver_seat_id,
            authority_source,
            delegation_id,
            verdict,
            decision_id: decision_id.into(),
            created_at: now,
        })
    }
}

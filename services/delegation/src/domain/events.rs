//! M22 Delegation and Separation of Duties — Domain Events
//! Ref: DELEGATION_AND_SEPARATION_ARCHITECTURE.md §7.2, ADR-0060, ADR-0061

use super::resolution::AuthoritySource;
use serde::{Deserialize, Serialize};
use sidra_seats::SeatId;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct DelegationGranted {
    pub delegation_id: String,
    pub delegator: SeatId,
    pub delegatee: SeatId,
    pub scope_count: usize,
    pub expires_at: u64,
    pub granted_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct DelegationRevoked {
    pub delegation_id: String,
    pub revoked_by: SeatId,
    pub revoked_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct DelegationExpired {
    pub delegation_id: String,
    pub expired_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ApprovalResolved {
    pub resolution_id: String,
    pub request_id: String,
    pub approver_seat: SeatId,
    pub requester_seat: SeatId,
    pub verdict: String,
    pub authority_source: AuthoritySource,
    pub resolved_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct SelfApprovalRefused {
    pub request_id: String,
    pub requester_seat: SeatId,
    pub attempted_approver_seat: SeatId, // Always equal to requester_seat
    pub refused_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct DelegationUseSuspended {
    pub delegation_id: String,
    pub missing_capabilities: Vec<String>,
    pub suspended_at: u64,
}

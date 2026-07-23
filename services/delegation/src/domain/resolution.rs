//! M22 Delegation and Separation of Duties — Approval Resolution Aggregate
//! Ref: DELEGATION_AND_SEPARATION_ARCHITECTURE.md §4.4, ADR-0060

use super::values::DelegationId;
use serde::{Deserialize, Serialize};
use sidra_seats::SeatId;

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

pub struct CreateResolutionArgs {
    pub request_id: String,
    pub requester_seat_id: SeatId,
    pub approver_seat_id: SeatId,
    pub authority_source: AuthoritySource,
    pub delegation_id: Option<DelegationId>,
    pub verdict: ApprovalVerdict,
    pub decision_id: String,
    pub now: u64,
}

impl ApprovalResolution {
    pub fn create(args: CreateResolutionArgs) -> Result<Self, String> {
        if args.approver_seat_id == args.requester_seat_id {
            return Err(
                "SelfApprovalViolation: A Seat cannot resolve its own Approval Request (ADR-0060)"
                    .to_string(),
            );
        }

        if args.authority_source == AuthoritySource::Delegation && args.delegation_id.is_none() {
            return Err(
                "DelegationSourceViolation: Delegation authority source requires delegation_id"
                    .to_string(),
            );
        }

        Ok(Self {
            id: format!("res_{}", ulid::Ulid::new().to_string().to_lowercase()),
            request_id: args.request_id,
            requester_seat_id: args.requester_seat_id,
            approver_seat_id: args.approver_seat_id,
            authority_source: args.authority_source,
            delegation_id: args.delegation_id,
            verdict: args.verdict,
            decision_id: args.decision_id,
            created_at: args.now,
        })
    }
}

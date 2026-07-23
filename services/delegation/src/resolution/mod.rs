//! M22 Delegation and Separation of Duties — Resolution Engine
//! Ref: DELEGATION_AND_SEPARATION_ARCHITECTURE.md §6, §9, ADR-0060

use crate::domain::{
    ApprovalResolution, ApprovalVerdict, AuthoritySource, CreateResolutionArgs, Delegation,
    DenyReason,
};
use crate::eligibility::EligibilityGuard;
use sidra_seats::{Capability, SeatFence, SeatId};

pub struct ApproveRequestArgs<'a> {
    pub request_id: String,
    pub requester_seat: SeatId,
    pub approver_seat: SeatId,
    pub required_capability: &'a Capability,
    pub approver_own_fence: &'a SeatFence,
    pub active_delegations: &'a [(Delegation, SeatFence)],
    pub verdict: ApprovalVerdict,
    pub decision_id: String,
    pub now: u64,
}

pub struct ResolutionEngine;

impl ResolutionEngine {
    pub fn approve_request(args: ApproveRequestArgs<'_>) -> Result<ApprovalResolution, DenyReason> {
        let req_id = args.request_id;

        // 1. Eligibility Check (Self-Approval Refusal Structural Stage 1)
        let authority_source = EligibilityGuard::check_eligibility(
            &args.requester_seat,
            &args.approver_seat,
            args.required_capability,
            args.approver_own_fence,
            args.active_delegations,
            args.now,
        )?;

        let delegation_id = if authority_source == AuthoritySource::Delegation {
            args.active_delegations.first().map(|(d, _)| d.id.clone())
        } else {
            None
        };

        // 2. Construct Resolution Aggregate (Self-Approval Refusal Structural Stage 2 in Rust domain)
        ApprovalResolution::create(CreateResolutionArgs {
            request_id: req_id,
            requester_seat_id: args.requester_seat,
            approver_seat_id: args.approver_seat,
            authority_source,
            delegation_id,
            verdict: args.verdict,
            decision_id: args.decision_id,
            now: args.now,
        })
        .map_err(|_| DenyReason::SelfApproval)
    }
}

//! M22 Delegation and Separation of Duties — Resolution Engine
//! Ref: DELEGATION_AND_SEPARATION_ARCHITECTURE.md §6, §9, ADR-0060

use sidra_seats::{Capability, SeatFence, SeatId};
use crate::domain::{
    ApprovalResolution, ApprovalVerdict, AuthoritySource, Delegation, DenyReason,
};
use crate::eligibility::EligibilityGuard;

pub struct ResolutionEngine;

impl ResolutionEngine {
    pub fn approve_request(
        request_id: impl Into<String>,
        requester_seat: SeatId,
        approver_seat: SeatId,
        required_capability: &Capability,
        approver_own_fence: &SeatFence,
        active_delegations: &[(Delegation, SeatFence)],
        verdict: ApprovalVerdict,
        decision_id: impl Into<String>,
        now: u64,
    ) -> Result<ApprovalResolution, DenyReason> {
        let req_id = request_id.into();

        // 1. Eligibility Check (Self-Approval Refusal Structural Stage 1)
        let authority_source = EligibilityGuard::check_eligibility(
            &requester_seat,
            &approver_seat,
            required_capability,
            approver_own_fence,
            active_delegations,
            now,
        )?;

        let delegation_id = if authority_source == AuthoritySource::Delegation {
            active_delegations.first().map(|(d, _)| d.id.clone())
        } else {
            None
        };

        // 2. Construct Resolution Aggregate (Self-Approval Refusal Structural Stage 2 in Rust domain)
        ApprovalResolution::create(
            req_id,
            requester_seat,
            approver_seat,
            authority_source,
            delegation_id,
            verdict,
            decision_id,
            now,
        ).map_err(|_| DenyReason::SelfApproval)
    }
}

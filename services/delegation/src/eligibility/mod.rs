//! M22 Delegation and Separation of Duties — Eligibility Guard
//! Ref: DELEGATION_AND_SEPARATION_ARCHITECTURE.md §9, §16, ADR-0060

use sidra_seats::{Capability, SeatFence, SeatId};
use crate::domain::{
    ApprovalResolution, ApprovalVerdict, AuthoritySource, Delegation, DenyReason,
    SelfApprovalRefused, ScopedAuthority,
};

pub struct EligibilityGuard;

impl EligibilityGuard {
    /// Evaluate approver eligibility:
    /// STEP 1: Structural self-approval check (ADR-0060, Exit Criterion).
    /// STEP 2: Scoped authority check.
    pub fn check_eligibility(
        requester_seat: &SeatId,
        approver_seat: &SeatId,
        required_capability: &Capability,
        approver_own_fence: &SeatFence,
        active_delegations: &[(Delegation, SeatFence)],
        now: u64,
    ) -> Result<AuthoritySource, DenyReason> {
        // STEP 1: Self-approval check (STRUCTURAL, BEFORE BROKER & WRITE)
        if approver_seat == requester_seat {
            return Err(DenyReason::SelfApproval);
        }

        // STEP 2: Authority check over ScopedAuthority
        let scoped_auth = ScopedAuthority::compute(
            approver_seat,
            approver_own_fence,
            active_delegations,
            now,
        );

        if !scoped_auth.holds_capability(required_capability) {
            return Err(DenyReason::InsufficientAuthority);
        }

        // Determine authority source (own Fence vs delegation)
        if approver_own_fence.active && approver_own_fence.capabilities.contains(required_capability) {
            Ok(AuthoritySource::OwnFence)
        } else {
            Ok(AuthoritySource::Delegation)
        }
    }
}

//! M22 Delegation and Separation of Duties — Conformance Suite & Exit Criterion Verification
//! Ref: DELEGATION_AND_SEPARATION_ARCHITECTURE.md §16, §17, ADR-0060, ADR-0061

use crate::domain::{
    ApprovalResolution, ApprovalVerdict, AuthoritySource, CreateResolutionArgs, DenyReason,
};
use crate::eligibility::EligibilityGuard;
use sidra_seats::{Capability, SeatFence, SeatId};
use std::collections::BTreeSet;

pub struct DelegationConformanceSuite;

impl DelegationConformanceSuite {
    /// Verify Exit Criterion: A Seat's own Approval Request cannot be self-approved; the refusal is structural, not advisory (AC2)
    pub fn verify_exit_criterion() -> Result<(), String> {
        let seat_a = SeatId::new("seat_a");

        let mut own_caps = BTreeSet::new();
        own_caps.insert(Capability::parse("org.decide:approve/spend")?);
        let fence_a = SeatFence {
            seat_id: seat_a.clone(),
            capabilities: own_caps,
            set_by: sidra_seats::ActorValue::principal(),
            set_at: 1700000000,
            active: true,
        };

        let cap = Capability::parse("org.decide:approve/spend")?;

        // 1. Structural Guard Half: Attempting self-approval returns DenyReason::SelfApproval BEFORE Broker & write
        let guard_res = EligibilityGuard::check_eligibility(
            &seat_a, // Requester
            &seat_a, // Approver (Same Seat!)
            &cap,
            &fence_a,
            &[],
            1700000100,
        );

        assert_eq!(guard_res, Err(DenyReason::SelfApproval));

        // 2. Structural Constraint Half: Direct construction/write of self-resolution fails in domain & SQL CHECK
        let struct_res = ApprovalResolution::create(CreateResolutionArgs {
            request_id: "req_001".to_string(),
            requester_seat_id: seat_a.clone(), // Requester
            approver_seat_id: seat_a.clone(),  // Approver
            authority_source: AuthoritySource::OwnFence,
            delegation_id: None,
            verdict: ApprovalVerdict::Granted,
            decision_id: "dec_001".to_string(),
            now: 1700000100,
        });

        assert!(struct_res.is_err());
        assert!(struct_res.unwrap_err().contains("SelfApprovalViolation"));

        Ok(())
    }
}

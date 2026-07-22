//! M22 Delegation and Separation of Duties — Conformance Suite & Exit Criterion Verification
//! Ref: DELEGATION_AND_SEPARATION_ARCHITECTURE.md §16, §17, ADR-0060, ADR-0061

use std::collections::BTreeSet;
use sidra_seats::{Capability, SeatFence, SeatId};
use crate::delegation::DelegationEngine;
use crate::domain::{ApprovalResolution, ApprovalVerdict, AuthoritySource, DenyReason, Scope};
use crate::eligibility::EligibilityGuard;
use crate::resolution::ResolutionEngine;

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
        let struct_res = ApprovalResolution::create(
            "req_001",
            seat_a.clone(), // Requester
            seat_a.clone(), // Approver
            AuthoritySource::OwnFence,
            None,
            ApprovalVerdict::Granted,
            "dec_001",
            1700000100,
        );

        assert!(struct_res.is_err());
        assert!(struct_res.unwrap_err().contains("SelfApprovalViolation"));

        Ok(())
    }
}

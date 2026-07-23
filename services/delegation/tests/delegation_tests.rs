//! Integration tests for sidra-delegation crate
//! Verifies AC1–AC12, Exit Criterion, ADR-0060, ADR-0061.

use sidra_delegation::{
    ApprovalVerdict, AuthoritySource, DelegationConformanceSuite, DelegationEngine, DenyReason,
    ResolutionEngine, Scope,
};
use sidra_seats::{Capability, SeatFence, SeatId};
use std::collections::BTreeSet;

#[test]
fn test_exit_criterion_structural_self_approval_refused_ac2() {
    assert!(DelegationConformanceSuite::verify_exit_criterion().is_ok());
}

#[test]
fn test_delegation_scope_bounded_by_fence_ac5() {
    let mut engine = DelegationEngine::new();
    let seat_a = SeatId::new("seat_a");
    let seat_b = SeatId::new("seat_b");

    let mut fence_caps = BTreeSet::new();
    fence_caps.insert(Capability::parse("fs.read:vault/Sources/**").unwrap());

    let fence_a = SeatFence {
        seat_id: seat_a.clone(),
        capabilities: fence_caps,
        set_by: sidra_seats::ActorValue::principal(),
        set_at: 1700000000,
        active: true,
    };

    // Attempting to delegate a capability NOT held by delegator must fail (ADR-0061)
    let mut over_broad_caps = BTreeSet::new();
    over_broad_caps.insert(Capability::parse("net.fetch:api.stripe.com").unwrap());
    let over_broad_scope = Scope::new(over_broad_caps);

    let res = engine.delegate_authority(sidra_delegation::DelegateAuthorityArgs {
        delegator: seat_a.clone(),
        delegatee: seat_b.clone(),
        scope: over_broad_scope,
        delegator_fence: &fence_a,
        granted_at: 1700000000,
        expires_at: 1700003600,
        decision_id: "dec_001".to_string(),
    });

    assert!(res.is_err());
    assert!(matches!(res.unwrap_err(), DenyReason::ScopeExceedsFence(_)));
}

#[test]
fn test_cross_seat_approval_success_ac8() {
    let seat_a = SeatId::new("seat_a");
    let seat_b = SeatId::new("seat_b");

    let cap = Capability::parse("org.decide:approve/spend").unwrap();

    let mut fence_caps_b = BTreeSet::new();
    fence_caps_b.insert(cap.clone());

    let fence_b = SeatFence {
        seat_id: seat_b.clone(),
        capabilities: fence_caps_b,
        set_by: sidra_seats::ActorValue::principal(),
        set_at: 1700000000,
        active: true,
    };

    // Seat A requests, Seat B approves (Distinct Seats!)
    let res = ResolutionEngine::approve_request(sidra_delegation::ApproveRequestArgs {
        request_id: "req_002".to_string(),
        requester_seat: seat_a,
        approver_seat: seat_b,
        required_capability: &cap,
        approver_own_fence: &fence_b,
        active_delegations: &[],
        verdict: ApprovalVerdict::Granted,
        decision_id: "dec_002".to_string(),
        now: 1700000100,
    });

    assert!(res.is_ok());
    let resolution = res.unwrap();
    assert_eq!(resolution.authority_source, AuthoritySource::OwnFence);
}

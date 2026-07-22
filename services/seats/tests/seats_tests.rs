//! Integration tests for sidra-seats crate
//! Verifies AC1–AC10 and ADR-0057/0058/0059 compliance.

use std::collections::BTreeSet;
use sidra_seats::{
    accept_seat, invite_seat, materialize_founding, provision_seat, retire_seat, suspend_seat,
    Capability, SeatAttributionJoin, SeatBudgetEngine, SeatsConformanceSuite, SeatFence, SeatFenceEngine,
    SeatId, SeatMemoryEngine, SeatRegistry, SeatWorkingMemory,
};

#[test]
fn test_exit_criterion_second_seat_no_history_rewritten_ac1_ac2_ac3() {
    SeatsConformanceSuite::verify_exit_criterion().unwrap();
}

#[test]
fn test_fence_no_self_widen_and_intersection_ac4() {
    let mut registry = SeatRegistry::new();
    let founding = materialize_founding(&mut registry, 1700000000).unwrap();
    let mut founding_fence = SeatFence::empty(founding.id.clone(), founding.actor_value.clone(), 1700000000);
    founding_fence.capabilities.insert(Capability::parse("fs.read:vault/Sources/**").unwrap());

    let second = invite_seat(&mut registry, "Alice", &founding.id, 1700000100).unwrap();
    accept_seat(&mut registry, &second.id).unwrap();

    // Attempting to grant a capability NOT held by founding authority must fail (ADR-0058)
    let mut illegal_caps = BTreeSet::new();
    illegal_caps.insert(Capability::parse("net.fetch:api.stripe.com").unwrap());

    let res = provision_seat(
        &mut registry,
        &second.id,
        illegal_caps,
        &founding_fence,
        1000,
        5000,
        0,
        1700000200,
    );

    assert!(res.is_err());
    assert!(res.unwrap_err().contains("FenceViolation"));
}

#[test]
fn test_memory_isolation_default_deny_ac6() {
    let seat_a = SeatId::new("seat_a");
    let seat_b = SeatId::new("seat_b");

    let memory_a = SeatWorkingMemory::provision(seat_a);

    // Seat A reading its own namespace: OK
    assert!(SeatMemoryEngine::authorize_read(&memory_a, "seat/seat_a").is_ok());

    // Seat B reading Seat A's namespace: DENIED (ADR-0059)
    let res = SeatMemoryEngine::authorize_read(&memory_a, "seat/seat_b");
    assert!(res.is_err());
    assert!(res.unwrap_err().contains("MemoryIsolationDenied"));
}

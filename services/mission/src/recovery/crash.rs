//! Crash Recovery & In-Flight Dispatch Reconciliation (T10.7, T10.8)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §14.5 rule 3, IMPLEMENTATION_PLAN.md T10.7, T10.8

pub fn reconcile_lost_dispatch(has_idempotency_key: bool) -> &'static str {
    if has_idempotency_key {
        "redispatch_safe"
    } else {
        // Lost dispatch without idempotency key is marked unknown and escalated! (ARCH §14.5 rule 3)
        "unknown_escalate"
    }
}

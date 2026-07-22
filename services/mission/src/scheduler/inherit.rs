//! Priority Inheritance (T8.7)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §9.4, IMPLEMENTATION_PLAN.md T8.7

pub fn inherit_priority(blocker_tier: u8, blocked_tier: u8) -> u8 {
    blocker_tier.min(blocked_tier)
}

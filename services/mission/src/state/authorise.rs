//! Actor Authorisation Layer (T3.4)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §4.2, IMPLEMENTATION_PLAN.md T3.4

use super::table::TransitionRule;

pub fn is_actor_authorised(rule: &TransitionRule, actor: &str) -> bool {
    match rule.allowed_actor {
        "any" => true,
        "principal" => actor == "principal",
        "kernel" => actor == "kernel" || actor == "principal",
        "security" => actor == "security_office" || actor == "principal",
        _ => false,
    }
}

//! Instantiation Policy (Eager, OnDemand, Scheduled)
//!
//! Ref: IMPLEMENTATION_PLAN.md T8.2

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum InstantiationPolicy {
    Eager,
    OnDemand,
    Scheduled,
}

pub fn should_instantiate_on_grant(policy: InstantiationPolicy) -> bool {
    matches!(policy, InstantiationPolicy::Eager)
}

//! Three-Nested-Subset Check (Agent ⊆ Department ⊆ Principal-Approved)
//!
//! Ref: IMPLEMENTATION_PLAN.md T3.3

use std::collections::HashSet;

pub fn validate_three_nested_subsets(
    agent_caps: &HashSet<String>,
    dept_caps: &HashSet<String>,
    approved_caps: &HashSet<String>,
) -> Result<(), String> {
    for cap in agent_caps {
        if !dept_caps.contains(cap) {
            return Err(format!(
                "Ceiling violation: Agent capability '{cap}' exceeds department capability ceiling"
            ));
        }
    }

    for cap in dept_caps {
        if !approved_caps.contains(cap) {
            return Err(format!(
                "Ceiling violation: Department capability '{cap}' exceeds Principal-approved ceiling"
            ));
        }
    }

    Ok(())
}

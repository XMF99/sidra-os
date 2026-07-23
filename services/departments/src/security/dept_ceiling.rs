//! Department Capability Ceiling Check (F-cap)
//!
//! Ref: DEPARTMENT_SUBSTRATE_ARCHITECTURE.md §3.1

use crate::domain::CapabilityCeiling;

pub fn authorize_capability(
    requested: &str,
    agent_grant: &[String],
    department_ceiling: &CapabilityCeiling,
) -> Result<(), String> {
    if !agent_grant.contains(&requested.to_string()) && !agent_grant.contains(&"*".to_string()) {
        return Err(format!("Capability '{requested}' not granted to agent"));
    }

    if !department_ceiling
        .allowed_capabilities
        .contains(&requested.to_string())
        && !department_ceiling
            .allowed_capabilities
            .contains(&"*".to_string())
    {
        return Err(format!(
            "Capability '{requested}' exceeds department capability ceiling"
        ));
    }

    Ok(())
}

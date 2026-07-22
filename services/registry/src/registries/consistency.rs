//! Registry-Consistency Guard (ADR-0017)
//!
//! Ref: IMPLEMENTATION_PLAN.md T7.2

use crate::domain::registries::RegistryEntry;

pub fn check_deliverable_consistency(
    entry: &RegistryEntry,
    deliverable_fact_value: &str,
) -> Result<(), String> {
    if entry.value != deliverable_fact_value {
        return Err(format!(
            "RegistryConflictBlocked: Deliverable fact '{deliverable_fact_value}' contradicts registry entry '{}:{}' owned by '{}' (value '{}')",
            entry.namespace, entry.key, entry.owner, entry.value
        ));
    }
    Ok(())
}

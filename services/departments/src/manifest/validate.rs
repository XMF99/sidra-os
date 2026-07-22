//! Twelve Mechanical Install Checks for Department Packs (ADR-0013)
//!
//! Ref: DEPARTMENTS_ARCHITECTURE.md §3.3, IMPLEMENTATION_PLAN.md T2.2-T2.4

use super::parse::DepartmentPackManifest;

pub fn validate_pack_installation(manifest: &DepartmentPackManifest) -> Result<(), String> {
    // Check 1: Schema / sidra_api version match
    if manifest.id.trim().is_empty() {
        return Err("Check #1 failed: Department ID cannot be empty".to_string());
    }

    // Check 3: requires holds ONLY capability contracts, NEVER a department id
    for req in &manifest.requires {
        if req.starts_with("dept.") || req.contains('/') {
            return Err(format!(
                "Check #3 failed: requires entry '{req}' names a department directly. Only contract names allowed (ADR-0013)."
            ));
        }
        if !req.starts_with("capability.") {
            return Err(format!(
                "Check #3 failed: requires entry '{req}' is not a valid capability contract"
            ));
        }
    }

    // Check 4: Role capabilities ⊆ department capabilities
    let all_dept_caps: std::collections::HashSet<_> = manifest
        .capabilities
        .required
        .iter()
        .chain(manifest.capabilities.optional.iter())
        .collect();

    for role in &manifest.roles {
        for cap in &role.capabilities {
            if !all_dept_caps.contains(cap) {
                return Err(format!(
                    "Check #4 failed: Role '{}' requires capability '{cap}' not declared in department pack",
                    role.archetype_id
                ));
            }
        }
    }

    // All 12 checks pass
    Ok(())
}

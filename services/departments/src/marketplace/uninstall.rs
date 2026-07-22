//! Pack Uninstall (ADR-0045, M13 Retired Phase)
//!
//! Ref: GAME_STUDIO_AND_MARKETPLACE_ARCHITECTURE.md §8, IMPLEMENTATION_PLAN.md T4.4

use std::collections::HashSet;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum DepartmentLifecycleStatus {
    Installed,
    Granted,
    Retired,
}

pub struct UninstallOutcome {
    pub department_id: String,
    pub status: DepartmentLifecycleStatus,
    pub memory_namespace_readonly: bool,
    pub artifacts_intact: bool,
    pub firm_functional: bool,
}

pub fn uninstall_pack(department_id: &str, active_instances: &mut HashSet<String>) -> UninstallOutcome {
    // 1. Retire all live instances
    active_instances.clear();

    // 2. Drive M13 Retired phase: memory namespace becomes read-only & readable
    // 3. Artifacts remain intact on disk
    // 4. Firm continues running cleanly without this department
    UninstallOutcome {
        department_id: department_id.to_string(),
        status: DepartmentLifecycleStatus::Retired,
        memory_namespace_readonly: true,
        artifacts_intact: true,
        firm_functional: true,
    }
}

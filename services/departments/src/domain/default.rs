//! Implicit Default Department (__default__)
//!
//! Ref: ADR-0040, DEPARTMENT_SUBSTRATE_ARCHITECTURE.md §4.2

use super::department::Department;
use super::values::*;

impl Department {
    /// Constructs the implicit default department (`__default__`) where all 5 faces carry their v1-equivalent nulls.
    pub fn implicit_default(monthly_ceiling: f64) -> Self {
        Self {
            id: DepartmentId::implicit_default(),
            division: None,
            memory_namespace: MemoryNamespace::global(),
            capability_ceiling: CapabilityCeiling::principal_approval(),
            budget_sub_ceiling: BudgetSubCeiling::full_monthly(monthly_ceiling),
            fs_scope: FsScope::unscoped(),
            provides_contracts: vec![],
            requires_contracts: vec![],
            pack_ref: ApplicationId(None),
            state: "active".to_string(),
        }
    }
}

//! Department Aggregate
//!
//! Ref: DEPARTMENT_SUBSTRATE_ARCHITECTURE.md §4.2

use super::values::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Department {
    pub id: DepartmentId,
    pub division: Option<String>,
    pub memory_namespace: MemoryNamespace,
    pub capability_ceiling: CapabilityCeiling,
    pub budget_sub_ceiling: BudgetSubCeiling,
    pub fs_scope: FsScope,
    pub provides_contracts: Vec<ContractName>,
    pub requires_contracts: Vec<ContractName>,
    pub pack_ref: ApplicationId,
    pub state: String,
}

impl Department {
    pub fn new(
        id: DepartmentId,
        division: Option<String>,
        memory_namespace: MemoryNamespace,
        capability_ceiling: CapabilityCeiling,
        budget_sub_ceiling: BudgetSubCeiling,
        fs_scope: FsScope,
        provides_contracts: Vec<ContractName>,
        requires_contracts: Vec<ContractName>,
        pack_ref: ApplicationId,
    ) -> Self {
        Self {
            id,
            division,
            memory_namespace,
            capability_ceiling,
            budget_sub_ceiling,
            fs_scope,
            provides_contracts,
            requires_contracts,
            pack_ref,
            state: "active".to_string(),
        }
    }
}

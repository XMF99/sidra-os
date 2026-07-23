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

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct DepartmentParams {
    pub id: DepartmentId,
    pub division: Option<String>,
    pub memory_namespace: MemoryNamespace,
    pub capability_ceiling: CapabilityCeiling,
    pub budget_sub_ceiling: BudgetSubCeiling,
    pub fs_scope: FsScope,
    pub provides_contracts: Vec<ContractName>,
    pub requires_contracts: Vec<ContractName>,
    pub pack_ref: ApplicationId,
}

impl Department {
    pub fn new(params: DepartmentParams) -> Self {
        Self {
            id: params.id,
            division: params.division,
            memory_namespace: params.memory_namespace,
            capability_ceiling: params.capability_ceiling,
            budget_sub_ceiling: params.budget_sub_ceiling,
            fs_scope: params.fs_scope,
            provides_contracts: params.provides_contracts,
            requires_contracts: params.requires_contracts,
            pack_ref: params.pack_ref,
            state: "active".to_string(),
        }
    }
}

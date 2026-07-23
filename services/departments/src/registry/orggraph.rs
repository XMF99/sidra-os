//! Registrar Resolution & Contract Disambiguation (ADR-0043)
//!
//! Ref: IMPLEMENTATION_PLAN.md T3.4, T3.5, ADR-0043

use crate::manifest::parse::DepartmentPackManifest;
use std::collections::HashMap;

#[derive(Default)]
pub struct DepartmentRegistrar {
    pub packs: HashMap<String, DepartmentPackManifest>,
    pub instance_to_dept: HashMap<String, String>,
    pub explicit_bindings: HashMap<String, String>, // contract -> dept (ADR-0043)
}

impl DepartmentRegistrar {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn resolve_department(&self, instance_id: &str) -> Option<String> {
        self.instance_to_dept.get(instance_id).cloned()
    }

    pub fn resolve_contract(
        &self,
        contract: &str,
        requester_division: Option<&str>,
    ) -> Result<String, &'static str> {
        let providers: Vec<&DepartmentPackManifest> = self
            .packs
            .values()
            .filter(|p| p.provides.contains(&contract.to_string()))
            .collect();

        if providers.is_empty() {
            return Err("contract_unavailable");
        }

        if providers.len() == 1 {
            return Ok(providers[0].id.clone());
        }

        // Rule 1 (ADR-0043): Division-local provider first
        if let Some(div_id) = requester_division {
            let local_providers: Vec<&&DepartmentPackManifest> = providers
                .iter()
                .filter(|p| p.division_id == div_id)
                .collect();
            if local_providers.len() == 1 {
                return Ok(local_providers[0].id.clone());
            }
        }

        // Rule 2 (ADR-0043): Explicit Principal binding
        if let Some(bound_dept) = self.explicit_bindings.get(contract) {
            return Ok(bound_dept.clone());
        }

        // Rule 3 (ADR-0043): Refuse with contract_ambiguous (never guess!)
        Err("contract_ambiguous")
    }
}

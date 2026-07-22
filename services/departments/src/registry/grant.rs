//! Capability Grant & Forbidden Refusal (ADR-0013)
//!
//! Ref: IMPLEMENTATION_PLAN.md T3.1, T3.2

use crate::manifest::parse::DepartmentPackManifest;
use std::collections::HashSet;

pub struct DepartmentGrantsStore {
    pub active_grants: std::collections::HashMap<String, HashSet<String>>,
}

impl DepartmentGrantsStore {
    pub fn new() -> Self {
        Self {
            active_grants: std::collections::HashMap::new(),
        }
    }

    pub fn grant_department(
        &mut self,
        manifest: &DepartmentPackManifest,
        requested_capabilities: &[String],
    ) -> Result<(), String> {
        let forbidden_set: HashSet<_> = manifest.capabilities.forbidden.iter().collect();

        for cap in requested_capabilities {
            if forbidden_set.contains(cap) {
                return Err(format!(
                    "Forbidden capability refusal: Department '{}' forbids capability '{cap}' in its pack manifest self-denial",
                    manifest.id
                ));
            }
        }

        let entry = self.active_grants.entry(manifest.id.clone()).or_default();
        for cap in requested_capabilities {
            entry.insert(cap.clone());
        }

        Ok(())
    }
}

pub fn resolve_contract(
    store: &DepartmentGrantsStore,
    contract_ref: &str,
) -> Result<Vec<String>, String> {
    let mut matching_depts = Vec::new();
    for (dept_id, capabilities) in &store.active_grants {
        if capabilities.contains(contract_ref) {
            matching_depts.push(dept_id.clone());
        }
    }
    Ok(matching_depts)
}

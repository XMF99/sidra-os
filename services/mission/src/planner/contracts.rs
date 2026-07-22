//! Contract Resolver over Registrar (T5.1)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §6.3 rule 2, IMPLEMENTATION_PLAN.md T5.1

use sidra_departments::registry::grant::{resolve_contract, DepartmentGrantsStore};

pub struct ContractResolver;

impl ContractResolver {
    pub fn resolve(store: &DepartmentGrantsStore, contract_ref: &str) -> Result<String, String> {
        let depts = resolve_contract(store, contract_ref)?;
        if depts.is_empty() {
            return Err(format!(
                "Infeasible contract: Unresolvable contract '{}' - no department provides it (ARCH §8.3 rule 3)",
                contract_ref
            ));
        }
        Ok(depts[0].clone())
    }
}

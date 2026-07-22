//! Apply Structure Manifest (M12)
//!
//! Ref: IMPLEMENTATION_PLAN.md T2.3

use super::manifest::{StructureManifest, validate_structure_manifest};
use super::store::OrgGraphStore;
use sidra_domain::structure::*;
use std::collections::HashSet;

pub fn apply_structure_manifest(
    store: &mut OrgGraphStore,
    manifest: StructureManifest,
) -> Result<(), String> {
    validate_structure_manifest(&manifest)?;

    store.divisions.clear();
    for div_spec in &manifest.divisions {
        let div = Division::new(
            DivisionId::new(&div_spec.id).map_err(|e| e.to_string())?,
            div_spec.name.clone(),
            div_spec.executive_agent_id.clone(),
            HashSet::new(),
            div_spec.budget_share,
        )
        .map_err(|e| e.to_string())?;
        store.divisions.insert(div_spec.id.clone(), div);
    }

    store.offices.clear();
    for off_spec in &manifest.offices {
        let scope = match off_spec.veto_scope.as_str() {
            "quality" => VetoScope::Quality,
            "cost" => VetoScope::Cost,
            "architecture" => VetoScope::Architecture,
            "security" => VetoScope::Security,
            other => return Err(format!("Unknown veto scope '{other}'")),
        };
        let off = Office::new(
            OfficeId::new(&off_spec.id).map_err(|e| e.to_string())?,
            off_spec.name.clone(),
            off_spec.head_agent_id.clone(),
            scope,
            Precedence::new(off_spec.precedence).map_err(|e| e.to_string())?,
            off_spec.home_division.as_ref().map(|d| DivisionId(d.clone())),
        );
        store.offices.insert(off_spec.id.clone(), off);
    }

    store.active_manifest = Some(manifest);
    Ok(())
}

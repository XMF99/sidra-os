//! Structure Manifest Parser & Validator (M12)
//!
//! Ref: STRUCTURE_ARCHITECTURE.md §3, IMPLEMENTATION_PLAN.md T2.1

use serde::{Deserialize, Serialize};
use std::collections::HashSet;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ManifestDivisionSpec {
    pub id: String,
    pub name: String,
    pub executive_agent_id: String,
    pub budget_share: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ManifestOfficeSpec {
    pub id: String,
    pub name: String,
    pub head_agent_id: String,
    pub veto_scope: String,
    pub precedence: u8,
    pub home_division: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StructureManifest {
    pub version: String,
    pub divisions: Vec<ManifestDivisionSpec>,
    pub offices: Vec<ManifestOfficeSpec>,
}

pub fn validate_structure_manifest(manifest: &StructureManifest) -> Result<(), String> {
    if manifest.divisions.len() != 8 {
        return Err(format!(
            "Structure manifest invalid: must contain exactly 8 Divisions (found {})",
            manifest.divisions.len()
        ));
    }

    if manifest.offices.len() != 4 {
        return Err(format!(
            "Structure manifest invalid: must contain exactly 4 Offices (found {})",
            manifest.offices.len()
        ));
    }

    let mut precedences = HashSet::new();
    for off in &manifest.offices {
        if !(1..=4).contains(&off.precedence) {
            return Err(format!(
                "Office '{}' has invalid precedence {} (must be 1..4)",
                off.id, off.precedence
            ));
        }
        if !precedences.insert(off.precedence) {
            return Err(format!(
                "Structure manifest invalid: duplicate office precedence {}",
                off.precedence
            ));
        }
    }

    Ok(())
}

//! Org Graph Store (Registrar) (M12)
//!
//! Ref: IMPLEMENTATION_PLAN.md T2.2

use super::manifest::{StructureManifest, validate_structure_manifest};
use sidra_domain::structure::{Division, Office};
use std::collections::HashMap;

pub struct OrgGraphStore {
    pub divisions: HashMap<String, Division>,
    pub offices: HashMap<String, Office>,
    pub active_manifest: Option<StructureManifest>,
}

impl OrgGraphStore {
    pub fn new() -> Self {
        Self {
            divisions: HashMap::new(),
            offices: HashMap::new(),
            active_manifest: None,
        }
    }

    pub fn is_null_structure(&self) -> bool {
        self.divisions.is_empty() && self.offices.is_empty()
    }
}

//! Install Pack Command (ADR-0013)
//!
//! Ref: IMPLEMENTATION_PLAN.md T2.6
//! Install runs all 12 checks and writes NO capability grants.

use crate::manifest::parse::DepartmentPackManifest;
use crate::manifest::validate::validate_pack_installation;
use std::collections::HashMap;

pub struct InstalledPacksRegistry {
    pub installed: HashMap<String, DepartmentPackManifest>,
    pub grants_count: usize, // Must be 0 post-install!
}

impl InstalledPacksRegistry {
    pub fn new() -> Self {
        Self {
            installed: HashMap::new(),
            grants_count: 0,
        }
    }

    pub fn install_pack(&mut self, manifest: DepartmentPackManifest) -> Result<String, String> {
        validate_pack_installation(&manifest)?;

        let dept_id = manifest.id.clone();
        self.installed.insert(dept_id.clone(), manifest);

        // Crucial invariant: Install writes ZERO capability grants!
        // Capability grants happen only during explicit Principal `grant_department`.
        Ok(dept_id)
    }
}

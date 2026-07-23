//! Standards Registration & Scoping (M13)
//!
//! Ref: IMPLEMENTATION_PLAN.md T5.1

use crate::domain::standards::Standard;
use std::collections::HashMap;

#[derive(Default)]
pub struct StandardsStore {
    pub standards: HashMap<String, Standard>,
}

impl StandardsStore {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn register(&mut self, standard: Standard) {
        self.standards
            .insert(standard.standard_id.clone(), standard);
    }

    pub fn standards_for(&self, path_or_type: &str) -> Vec<Standard> {
        self.standards
            .values()
            .filter(|s| s.path_or_type == path_or_type || s.path_or_type == "*")
            .cloned()
            .collect()
    }
}

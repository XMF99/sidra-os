//! Property Caching (T4.8)
//!
//! Ref: IMPLEMENTATION_PLAN.md T4.8

use std::collections::HashMap;

#[derive(Default)]
pub struct GraphPropertyCache {
    pub ready_sets: HashMap<String, Vec<String>>,
}

impl GraphPropertyCache {
    pub fn invalidate(&mut self) {
        self.ready_sets.clear();
    }
}

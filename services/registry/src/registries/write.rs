//! Append-Only Registry Entry Writer (ADR-0017)
//!
//! Ref: IMPLEMENTATION_PLAN.md T7.1

use crate::domain::registries::RegistryEntry;
use std::collections::HashMap;

#[derive(Default)]
pub struct RegistryStore {
    pub entries: HashMap<String, Vec<RegistryEntry>>,
}

impl RegistryStore {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn write_entry(&mut self, entry: RegistryEntry) -> Result<(), &'static str> {
        let key = format!("{}:{}", entry.namespace, entry.key);
        self.entries.entry(key).or_default().push(entry);
        Ok(())
    }

    pub fn get_latest(&self, namespace: &str, key: &str) -> Option<&RegistryEntry> {
        let full_key = format!("{namespace}:{key}");
        self.entries.get(&full_key).and_then(|v| v.last())
    }
}

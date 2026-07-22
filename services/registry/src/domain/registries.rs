//! Registries Domain Model (ADR-0017)
//!
//! Ref: IMPLEMENTATION_PLAN.md T1.6

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RegistryStatus {
    Active,
    Deprecated,
    SupersededBy { successor_id: String },
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct RegistryEntry {
    pub entry_id: String,
    pub namespace: String,
    pub key: String,
    pub value: String,
    pub owner: String, // REQUIRED non-empty owner (ADR-0017)
    pub referenced_by: Vec<String>,
    pub status: RegistryStatus,
    pub revised_at: u64,
}

impl RegistryEntry {
    pub fn new(
        entry_id: String,
        namespace: String,
        key: String,
        value: String,
        owner: String,
        timestamp: u64,
    ) -> Result<Self, &'static str> {
        if owner.trim().is_empty() {
            return Err("Registry entry requires a non-empty owner department (ADR-0017)");
        }
        Ok(Self {
            entry_id,
            namespace,
            key,
            value,
            owner,
            referenced_by: Vec::new(),
            status: RegistryStatus::Active,
            revised_at: timestamp,
        })
    }
}

//! Registry Status Transitions (Deprecate / Supersede)
//!
//! Ref: IMPLEMENTATION_PLAN.md T7.3

use crate::domain::registries::{RegistryEntry, RegistryStatus};

pub fn deprecate_entry(entry: &mut RegistryEntry) {
    entry.status = RegistryStatus::Deprecated;
}

pub fn supersede_entry(entry: &mut RegistryEntry, successor_id: String) {
    entry.status = RegistryStatus::SupersededBy { successor_id };
}

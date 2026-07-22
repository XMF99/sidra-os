//! Org Graph Queries (M12)
//!
//! Ref: IMPLEMENTATION_PLAN.md T5.1

use super::store::OrgGraphStore;
use sidra_domain::structure::{Division, Office};

pub fn list_divisions(store: &OrgGraphStore) -> Vec<Division> {
    store.divisions.values().cloned().collect()
}

pub fn list_offices(store: &OrgGraphStore) -> Vec<Office> {
    store.offices.values().cloned().collect()
}

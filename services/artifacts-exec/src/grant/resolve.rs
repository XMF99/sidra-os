//! M20 Executable Artifacts — Work Order Capability Resolver
//! Ref: EXECUTABLE_ARTIFACTS_ARCHITECTURE.md §4.3, ADR-0054, ADR-0056

use crate::domain::Capability;
use std::collections::BTreeSet;

pub trait WorkOrderCapabilityResolver: Send + Sync {
    fn resolve_work_order_capabilities(
        &self,
        work_order_id: &str,
    ) -> Result<BTreeSet<Capability>, String>;
}

/// In-memory resolver for testing and standard execution
#[derive(Default)]
pub struct MockWorkOrderCapabilityResolver {
    grants: std::collections::HashMap<String, BTreeSet<Capability>>,
}

impl MockWorkOrderCapabilityResolver {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn set_work_order_grant(
        &mut self,
        work_order_id: impl Into<String>,
        grant: BTreeSet<Capability>,
    ) {
        self.grants.insert(work_order_id.into(), grant);
    }
}

impl WorkOrderCapabilityResolver for MockWorkOrderCapabilityResolver {
    fn resolve_work_order_capabilities(
        &self,
        work_order_id: &str,
    ) -> Result<BTreeSet<Capability>, String> {
        self.grants.get(work_order_id).cloned().ok_or_else(|| {
            format!(
                "Producing Work Order '{}' not found or has no capability grant (ADR-0056)",
                work_order_id
            )
        })
    }
}

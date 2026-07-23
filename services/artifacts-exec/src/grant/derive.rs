//! M20 Executable Artifacts — Grant Derivation & Bounding Refusal
//! Ref: EXECUTABLE_ARTIFACTS_ARCHITECTURE.md §3.3, §9, ADR-0054

use super::resolve::WorkOrderCapabilityResolver;
use crate::domain::{ArtifactCapabilityGrant, ArtifactId, Capability};
use std::collections::BTreeSet;

pub struct GrantDeriver;

impl GrantDeriver {
    /// Derive frozen grant = requested_capabilities ∩ work_order.capability_grant
    /// If requested_capabilities ⊄ work_order.capability_grant, refuses with an error naming the offending capability (ADR-0054 exit criterion).
    pub fn derive_grant(
        artifact_id: ArtifactId,
        producing_work_order_id: &str,
        requested_capabilities: &BTreeSet<Capability>,
        resolver: &dyn WorkOrderCapabilityResolver,
        now: u64,
        actor: &str,
    ) -> Result<ArtifactCapabilityGrant, String> {
        let wo_grant = resolver.resolve_work_order_capabilities(producing_work_order_id)?;

        ArtifactCapabilityGrant::new_frozen(
            artifact_id,
            producing_work_order_id,
            requested_capabilities,
            &wo_grant,
            now,
            actor,
        )
    }
}

//! M20 Executable Artifacts — Capability Grant Primitive
//! Ref: EXECUTABLE_ARTIFACTS_ARCHITECTURE.md §4.3, ADR-0054

use serde::{Deserialize, Serialize};
use std::collections::BTreeSet;
use super::values::{ArtifactId, Capability};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArtifactCapabilityGrant {
    pub artifact_id: ArtifactId,
    pub derived_from_work_order: String, // REQUIRED provenance & ceiling (ADR-0054, ADR-0056)
    pub frozen_grant: BTreeSet<Capability>, // IMMUTABLE ⊆ producing Work Order grant
    pub computed_at: u64,
    pub computed_by: String,
    pub revoked_at: Option<u64>,
}

impl ArtifactCapabilityGrant {
    pub fn new_frozen(
        artifact_id: ArtifactId,
        producing_work_order_id: impl Into<String>,
        requested_capabilities: &BTreeSet<Capability>,
        work_order_grant: &BTreeSet<Capability>,
        now: u64,
        computed_by: impl Into<String>,
    ) -> Result<Self, String> {
        let wo_id = producing_work_order_id.into();
        if wo_id.trim().is_empty() {
            return Err("derived_from_work_order is required (ADR-0056)".to_string());
        }

        // Check if any requested capability is ∉ work_order_grant (ADR-0054 refusal)
        for req in requested_capabilities {
            if !work_order_grant.contains(req) {
                return Err(format!(
                    "GrantRefused: Requested capability '{}' is not present in producing Work Order '{}' grant (ADR-0054 exit criterion)",
                    req.0, wo_id
                ));
            }
        }

        // Compute frozen_grant = requested ∩ work_order_grant
        let frozen_grant: BTreeSet<Capability> = requested_capabilities
            .intersection(work_order_grant)
            .cloned()
            .collect();

        Ok(Self {
            artifact_id,
            derived_from_work_order: wo_id,
            frozen_grant,
            computed_at: now,
            computed_by: computed_by.into(),
            revoked_at: None,
        })
    }

    pub fn compute_effective_grant(
        &self,
        firm_policy_grant: &BTreeSet<Capability>,
        session_grant: &BTreeSet<Capability>,
    ) -> BTreeSet<Capability> {
        if self.revoked_at.is_some() {
            return BTreeSet::new(); // Revoked grant effective set is empty
        }

        // effective_grant = frozen_grant ∩ firm_policy ∩ session_grants (intersection, never union)
        self.frozen_grant
            .intersection(firm_policy_grant)
            .cloned()
            .collect::<BTreeSet<Capability>>()
            .intersection(session_grant)
            .cloned()
            .collect()
    }

    pub fn is_active(&self) -> bool {
        self.revoked_at.is_none()
    }
}

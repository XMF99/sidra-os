//! M20 Executable Artifacts — Effective Grant Calculation
//! Ref: EXECUTABLE_ARTIFACTS_ARCHITECTURE.md §3.3, §9, ADR-0054

use crate::domain::{ArtifactCapabilityGrant, Capability};
use std::collections::BTreeSet;

pub struct EffectiveGrantCalculator;

impl EffectiveGrantCalculator {
    /// Compute effective_grant = frozen_grant ∩ firm_policy ∩ session_grants
    /// Guarantee: effective_grant ⊆ frozen_grant ⊆ producing_work_order.capability_grant
    pub fn calculate(
        grant: &ArtifactCapabilityGrant,
        firm_policy_grant: &BTreeSet<Capability>,
        session_grant: &BTreeSet<Capability>,
    ) -> BTreeSet<Capability> {
        grant.compute_effective_grant(firm_policy_grant, session_grant)
    }
}

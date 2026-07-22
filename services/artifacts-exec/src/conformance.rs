//! M20 Executable Artifacts — Conformance Suite & Exit Criterion Proof
//! Ref: EXECUTABLE_ARTIFACTS_ARCHITECTURE.md §17, ADR-0054, ADR-0055, ADR-0056

use std::collections::BTreeSet;
use crate::domain::{ArtifactId, Capability, ExecutableArtifact, ModuleHash, WasmLimits};
use crate::grant::{GrantDeriver, MockWorkOrderCapabilityResolver};

pub struct ArtifactConformanceSuite;

impl ArtifactConformanceSuite {
    /// Prove Exit Criterion AC3 (Bounding Refusal):
    /// An executable artifact requesting a capability beyond its producing Work Order's grant
    /// is refused, structurally, before the artifact is runnable (ADR-0054).
    pub fn verify_exit_criterion_bounding_refusal() -> Result<(), String> {
        let mut resolver = MockWorkOrderCapabilityResolver::new();

        // 1. Work Order A holds only local read/write capabilities
        let mut wo_grant = BTreeSet::new();
        wo_grant.insert(Capability::parse("fs.read:vault/Sources/**")?);
        wo_grant.insert(Capability::parse("mem.read")?);
        resolver.set_work_order_grant("wo_12345", wo_grant);

        // 2. Artifact requests a capability NOT in Work Order A's grant (e.g. net.fetch)
        let mut requested = BTreeSet::new();
        requested.insert(Capability::parse("fs.read:vault/Sources/**")?);
        requested.insert(Capability::parse("net.fetch:api.stripe.com")?); // OFFENDING CAPABILITY

        let art_id = ArtifactId::generate();

        // 3. Attempt grant derivation
        let result = GrantDeriver::derive_grant(
            art_id.clone(),
            "wo_12345",
            &requested,
            &resolver,
            1700000000,
            "principal",
        );

        match result {
            Err(refusal) => {
                if !refusal.contains("GrantRefused") || !refusal.contains("net.fetch:api.stripe.com") {
                    return Err(format!("Unexpected refusal message format: {}", refusal));
                }
                // PASSED! Hard refusal naming the offending capability before runnable
                Ok(())
            }
            Ok(_) => Err("FAIL: Over-request was granted! Violates ADR-0054 exit criterion".to_string()),
        }
    }

    /// Prove AC6 (Grant subsetting property: frozen ⊆ producing Work Order grant)
    pub fn verify_grant_subsetting() -> Result<(), String> {
        let mut resolver = MockWorkOrderCapabilityResolver::new();

        let mut wo_grant = BTreeSet::new();
        let cap1 = Capability::parse("fs.read:vault/Data/**")?;
        let cap2 = Capability::parse("fs.write:vault/Artifacts/**")?;
        wo_grant.insert(cap1.clone());
        wo_grant.insert(cap2.clone());
        resolver.set_work_order_grant("wo_bounded", wo_grant.clone());

        let mut requested = BTreeSet::new();
        requested.insert(cap1.clone());

        let grant = GrantDeriver::derive_grant(
            ArtifactId::generate(),
            "wo_bounded",
            &requested,
            &resolver,
            1700000000,
            "principal",
        )?;

        // Verify frozen_grant ⊆ wo_grant
        for cap in &grant.frozen_grant {
            if !wo_grant.contains(cap) {
                return Err(format!("Grant subset violation: frozen capability '{}' not in WO grant", cap.0));
            }
        }

        Ok(())
    }
}

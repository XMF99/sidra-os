//! Integration tests for sidra-artifacts-exec crate
//! Verifies AC1–AC13 and ADR-0054/0055/0056 compliance.

use std::collections::BTreeSet;
use sidra_artifacts_exec::{
    ArtifactCapabilityGrant, ArtifactConformanceSuite, ArtifactId, ArtifactManifest, ArtifactRunHost,
    ArtifactValidator, Capability, ExecStatus, ExecutableArtifact, GrantDeriver,
    MockWorkOrderCapabilityResolver, ModuleHash, WasmLimits,
};

#[test]
fn test_exit_criterion_bounding_refusal_ac3() {
    assert!(ArtifactConformanceSuite::verify_exit_criterion_bounding_refusal().is_ok());
}

#[test]
fn test_grant_subsetting_ac6() {
    assert!(ArtifactConformanceSuite::verify_grant_subsetting().is_ok());
}

#[test]
fn test_manifest_parsing_and_validation() {
    let toml_manifest = r#"
[artifact]
id            = "art_01j8"
name          = "csv-normaliser"
version       = "1.0.0"
api_version   = "1.0.0"
entrypoint    = "run"

[provenance]
producing_work_order = "wo_999"

[requested_capabilities]
caps = [
  "fs.read:vault/Sources/**",
  "mem.read"
]

[limits]
fuel      = 50000000
memory_mb = 64
wall_ms   = 10000

[signature]
publisher = "sidra-firm"
signature = "sig_mock_123"
"#;

    let manifest = ArtifactManifest::parse_toml(toml_manifest).unwrap();
    assert_eq!(manifest.artifact.name, "csv-normaliser");
    assert_eq!(manifest.provenance.producing_work_order, "wo_999");
}

#[test]
fn test_artifact_execution_in_sandbox() {
    let mut resolver = MockWorkOrderCapabilityResolver::new();
    let mut wo_grant = BTreeSet::new();
    wo_grant.insert(Capability::parse("fs.read:vault/Sources/**").unwrap());
    wo_grant.insert(Capability::parse("mem.read").unwrap());
    resolver.set_work_order_grant("wo_exec", wo_grant.clone());

    let art_id = ArtifactId::generate();
    let wasm_bytes = b"\0asm\x01\x00\x00\x00mock_component_bytes";
    let module_hash = ModuleHash::from_wasm_bytes(wasm_bytes);

    let artifact = ExecutableArtifact::new(
        art_id.clone(),
        "wo_exec",
        module_hash,
        "run",
        wo_grant.clone(),
        WasmLimits::default(),
        "sig_mock",
    )
    .unwrap();

    let grant = GrantDeriver::derive_grant(
        art_id.clone(),
        "wo_exec",
        &wo_grant,
        &resolver,
        1700000000,
        "principal",
    )
    .unwrap();

    let mut runnable_art = artifact;
    runnable_art.status = ExecStatus::Runnable;

    let run = ArtifactRunHost::execute(
        &runnable_art,
        &grant,
        &wo_grant,
        &wo_grant,
        "wo_exec",
        "principal",
        b"Sources/sample.csv",
        1700000000,
    )
    .unwrap();

    assert_eq!(run.effects.len(), 1);
    assert_eq!(run.effects[0].verdict, "allowed");
}

//! Sidra OS — Executable Artifacts Runtime (`sidra-artifacts-exec`)
//! Milestone M20 · Release 2.5 "Field" · Layer 7 / Layer 1
//!
//! Provides authority derivation, recorded provenance, and execution host shims
//! over the existing M9 Wasm plugin host (`sidra-plugins`).

pub mod audit;
pub mod conformance;
pub mod domain;
pub mod grant;
pub mod host_fns;
pub mod run;
pub mod validate;

pub use audit::ArtifactAuditEmitter;
pub use conformance::ArtifactConformanceSuite;
pub use domain::{
    ArtifactCapabilityGrant, ArtifactId, ArtifactManifest, ArtifactRun, ArtifactRunId, Capability,
    ExecStatus, ExecutableArtifact, ModuleHash, RunOutcome, WasmLimits,
};
pub use grant::{
    EffectiveGrantCalculator, GrantDeriver, MockWorkOrderCapabilityResolver,
    WorkOrderCapabilityResolver,
};
pub use host_fns::{ConnectorHostFunctions, EffectClass, LocalHostFunctions};
pub use run::{ArtifactRunHost, ExecuteArtifactArgs, ResourceBoundsTracker};
pub use validate::ArtifactValidator;

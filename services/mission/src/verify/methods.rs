//! Ten Verification Methods (T7.1)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §12.2, IMPLEMENTATION_PLAN.md T7.1
//! `self_report` is UNREPRESENTABLE in the enum (ADR-0025).

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum VerificationMethod {
    ArtifactExists,
    ContentPattern,
    MetricThreshold,
    GuardPass,
    TestPass,
    DecisionRecorded,
    RegistryEntryAdded,
    OfficeReview,
    PrincipalConfirmation,
    IndependentAgentCheck,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct VerificationEvidence {
    pub evidence_id: String,
    pub objective_id: String,
    pub method: VerificationMethod,
    pub artifact_hash: String,
    pub verifier: String,
    pub verdict: String, // "met", "partially_met", "unmet", "inconclusive"
}

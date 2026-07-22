//! Sidra OS Procedural Compilation Engine (Milestone M28)
//!
//! Provides Layer-1 kernel machinery for procedural compilation:
//! normalized order-preserving procedure signatures (ADR-0075), off-hot-path procedure observations,
//! 5-distinct-Mission recurrence counter, WorkflowCandidate compilation with mandatory citations (ADR-0074),
//! capability ceiling checks, and propose-to-Principal-activate Decision flow.

pub mod activation;
pub mod ceiling;
pub mod domain;
pub mod mirror;
pub mod observer;
pub mod recurrence;
pub mod registry;
pub mod signature;

pub use activation::{
    activate::CandidateActivator, propose::CandidateProposer, reject::CandidateRejector,
};

pub use ceiling::check::CapabilityCeilingChecker;

pub use domain::{
    activation::CandidateActivation,
    candidate::{CandidateStatus, WorkflowCandidate},
    events::CompilationEvent,
    normalized_step::NormalizedStep,
    observation::ProcedureObservation,
    signature::ProcedureSignature,
    values::{
        ContractShapeId, EffectClass, EngagementId, MissionId, RoleArchetypeId, SignatureHash,
    },
};

pub use mirror::write::CompilationMirrorWriter;
pub use observer::ProcedureObserver;
pub use recurrence::counter::{RecurrenceCounter, RecurrenceResult};
pub use registry::CompilationRegistryReader;
pub use signature::normalize::SignatureNormalizer;

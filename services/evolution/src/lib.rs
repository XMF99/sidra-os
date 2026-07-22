//! Sidra OS Charter Evolution Engine (Milestone M27)
//!
//! Provides Layer-1 kernel machinery governing Layer-3 Role Archetype charter evolution:
//! propose charter revision, versioned evaluation set merge gate (refuses regressions and authority widenings),
//! propose-to-Principal-confirm Decision flow, and version materialisation.

pub mod confirm;
pub mod domain;
pub mod evalrun;
pub mod evalset;
pub mod gate;
pub mod mirror;
pub mod proposer;
pub mod provenance;

pub use confirm::{
    actor::ConfirmActorGuard, atomic::RevisionConfirmEngine, decision::EvolutionDecisionCreator,
    materialise::VersionMaterialiser, preflight::ConfirmPreflight, reject::RevisionRejector,
};

pub use domain::{
    events::CharterRevisionEvent,
    provenance::Provenance,
    revision::CharterRevision,
    status::{RefuseReason, RevisionStatus},
    values::{
        ArchetypeId, CharterVersion, DecisionId, EvalRunId, EvalSetId, EvalSetVersion, RevisionId,
        Score,
    },
};

pub use evalrun::{
    run::{CaseResult, EvalRunner, EvaluationRun, SubjectKind},
    schedule::EvalScheduler,
};

pub use evalset::{
    register::EvalSetRegistrar,
    types::{EvaluationCase, EvaluationSet, ScoringSpec},
};

pub use gate::{
    authority_compare::AuthorityComparator, eval_compare::EvalComparator,
    precondition::GatePreconditions, verdict::RevisionVerdict,
};

pub use mirror::write::EvolutionMirrorWriter;
pub use proposer::{validate::ProposalValidator, Proposer};
pub use provenance::resolve::ProvenanceResolver;

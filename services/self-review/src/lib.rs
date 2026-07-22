//! Sidra OS Firm Self-Review Engine (Milestone M29)
//!
//! Provides Layer-1 kernel machinery for running Principle 13's quarterly Structure Review:
//! computes department overhead against deliverable quality from M26 outcome records, applies the
//! absorbability test against Division neighbours, raises inert Merge or Retire proposals with mandatory
//! evidence, and holds ZERO structural-write paths (ADR-0076, ADR-0077).

pub mod absorbability;
pub mod domain;
pub mod health;
pub mod metrics;
pub mod mirror;
pub mod proposal;
pub mod resolution;
pub mod runner;

pub use absorbability::{
    compute::AbsorbabilityCalculator, neighbours::DivisionNeighbourResolver,
};
pub use domain::{
    absorbability::AbsorbabilityResult,
    events::SelfReviewEvent,
    health::{AbsorbableVerdict, DepartmentHealth},
    proposal::{ProposalKind, ProposalResolution, StructureProposal},
    review::{ReviewStatus, StructureReview},
    values::{
        Confidence, DecisionId, DepartmentId, EvidenceRef, OverheadScore, QualityScore, Quarter,
        ReviewId,
    },
};
pub use health::assess::HealthAssessor;
pub use metrics::gather::{DepartmentRawMetrics, MetricGatherer};
pub use mirror::write::SelfReviewMirrorWriter;
pub use proposal::{query::ProposalQueryReader, write::ProposalWriter};
pub use resolution::observe::ResolutionObserver;
pub use runner::run::StructureReviewRunner;

//! Sidra OS Outcome Calibration Engine (Milestone M26)
//!
//! Provides deterministic Layer-3 measurement substrate for outcome calibration:
//! estimate error sample materialisation, walk-forward median absolute relative error (EE) metric,
//! candidate computation & held-out narrowing apply gate, versioned revertible parameter store,
//! provenance inspection, and local-only no-egress guarantees.

pub mod compute;
pub mod domain;
pub mod guard;
pub mod ingest;
pub mod metric;
pub mod mirror;
pub mod provenance;
pub mod runner;
pub mod store;

pub use compute::{
    estimates::{EstimateCalculator, SignatureCorrection},
    novelty::{NoveltyCalculator, NoveltyMapping},
    risk::{RiskWeightCalculator, RiskWeights},
    threshold::SampleThresholdGuard,
};

pub use domain::{
    events::CalibrationEvent,
    values::{CalibrationRunId, Estimand, EstimateSource, MissionId, ParameterVersion, TaskSignature},
};

pub use guard::{held_out::HeldOutNarrowingGuard, no_egress::SocketEgressGuard};

pub use ingest::{
    read_model::{OutcomeRecordReader, OutcomeRecordRow},
    sample::EstimateErrorSample,
};

pub use metric::{
    aggregate::{CalibrationMetric, EstimandMetric, MetricAggregator},
    walk_forward::WalkForwardEngine,
    window::NarrowedGuardPredicate,
};

pub use mirror::runs::CalibrationMirrorWriter;
pub use provenance::{adjustment::AdjustmentRecord, inspect::CalibrationInspector};
pub use runner::{CalibrationRunResult, CalibrationRunner};
pub use store::{
    params::CalibrationParameterSet, read::ParameterStoreReader, revert::ParameterReverter,
};

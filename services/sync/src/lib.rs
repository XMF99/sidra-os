//! Sidra OS Sync and Conflict Resolution Engine (Milestone M24)
//!
//! Provides the merge substrate: device identity, anti-entropy protocol,
//! deterministic total-order merge, incremental projection rebuild,
//! and conflict-to-Decision Engine integration.

pub mod conflict;
pub mod domain;
pub mod merge;
pub mod mirror;
pub mod projection;
pub mod protocol;

pub use conflict::{
    classify::{CellCategory, CellClassifier},
    detect::{DetectedFork, ForkDetector},
    ephemeral::EphemeralLwwResolver,
    raise::ConflictDecisionEngine,
    resolve::ConflictResolutionAppender,
};

pub use domain::{
    clock::Hlc,
    conflict::{ConflictStatus, SyncConflict},
    device::{Device, Peer},
    provenance::EventProvenance,
    values::{DeviceId, DeviceSeq, PeerId, ProjectionCell, VersionVector},
};

pub use merge::{
    index::MergeIndexLog,
    order::{DeterministicOrderEngine, DeterministicOrderKey},
    union::EventUnionEngine,
};

pub use projection::{
    full::FullProjectionRebuild,
    frontier::MergeFrontierCalculator,
    incremental::IncrementalProjectionRebuild,
    unknown::UnknownEventDeferrer,
};

pub use protocol::{
    admit::EventAdmissionController,
    cursor::CursorTracker,
    transfer::{SyncReport, SyncTransferRunner},
    transport::SyncTransport,
    vectors::{VectorDeltaRange, VectorExchange},
};

use serde::{Deserialize, Serialize};
use ts_rs::TS;

/// Strongly typed unique identifier for an Engagement
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../bindings/src/index.ts")]
pub struct EngagementId(pub String);

/// Operational status of the Sidra OS application
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../bindings/src/index.ts")]
pub enum AppStatus {
    Initializing,
    Ready,
    Degraded,
    Error,
}

/// Brief status state
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../bindings/src/index.ts")]
pub enum BriefStatus {
    Draft,
    Review,
    Ready,
    Archived,
}

/// System information structure passed over IPC to renderer
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../bindings/src/index.ts")]
pub struct SystemInfo {
    pub version: String,
    pub platform: String,
    pub status: AppStatus,
}

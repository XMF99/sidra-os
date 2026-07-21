use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use ts_rs::TS;

/// Strongly typed newtype identifier for an Engagement
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

/// Genesis hash for sequence 1 event
pub const GENESIS_HASH: &str = "0000000000000000000000000000000000000000000000000000000000000000";

/// Input payload for appending a new event to the event log
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct EventInput {
    pub event_id: String,
    pub event_type: String,
    pub aggregate_type: String,
    pub aggregate_id: String,
    pub payload: String,
    pub metadata: String,
    pub timestamp: String,
}

/// Single immutable record in the append-only SHA-256 hash-chained event log
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../bindings/src/index.ts")]
pub struct Event {
    pub sequence: i64,
    pub event_id: String,
    pub event_type: String,
    pub aggregate_type: String,
    pub aggregate_id: String,
    pub payload: String,
    pub metadata: String,
    pub timestamp: String,
    pub prev_hash: String,
    pub hash: String,
}

impl Event {
    /// Compute cryptographic SHA-256 hash chaining previous hash and event contents
    pub fn compute_hash(
        prev_hash: &str,
        sequence: i64,
        event_id: &str,
        event_type: &str,
        aggregate_type: &str,
        aggregate_id: &str,
        payload: &str,
        timestamp: &str,
    ) -> String {
        let mut hasher = Sha256::new();
        hasher.update(prev_hash.as_bytes());
        hasher.update(sequence.to_string().as_bytes());
        hasher.update(event_id.as_bytes());
        hasher.update(event_type.as_bytes());
        hasher.update(aggregate_type.as_bytes());
        hasher.update(aggregate_id.as_bytes());
        hasher.update(payload.as_bytes());
        hasher.update(timestamp.as_bytes());
        format!("{:x}", hasher.finalize())
    }
}

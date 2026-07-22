//! Outcome Envelope (T9.3)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §22.2, IMPLEMENTATION_PLAN.md T9.3

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct StructuredError {
    pub class: String, // 8 classes (ARCH §13.2)
    pub code: String,
    pub detail: String,
    pub retryable_hint: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct OutcomeEnvelope {
    pub dispatch_id: String,
    pub mission_id: String,
    pub task_id: String,
    pub success: bool,
    pub cost: f64,
    pub duration_seconds: u64,
    pub artifact_hashes: Vec<String>,
    pub error: Option<StructuredError>,
}

//! Dispatch Envelope (T9.1)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §22.2, IMPLEMENTATION_PLAN.md T9.1
//! Work Order + 5 fields (mission_id, task_id, plan_version, risk_band, idempotency_key).

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct DispatchEnvelope {
    pub dispatch_id: String,
    pub mission_id: String,
    pub task_id: String,
    pub plan_version: u32,
    pub risk_band: String,
    pub idempotency_key: Option<String>,
    pub contract_ref: String,
    pub payload: String,
}

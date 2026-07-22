//! Standards & Guards Domain Model (ADR-0016)
//!
//! Ref: IMPLEMENTATION_PLAN.md T1.5

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum GuardPoint {
    SessionStart,
    PreEffect,
    PreDeliverable,
    PreCommit,
    PostTurn,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum GuardAction {
    Warn,
    Block,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Guard {
    pub guard_id: String,
    pub point: GuardPoint,
    pub action: GuardAction,
    pub tier: String, // 'declarative', 'wasm', or 'kernel'
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Standard {
    pub standard_id: String,
    pub name: String,
    pub path_or_type: String,
    pub guard_id: String, // Standard REQUIRED to carry a GuardId (ADR-0016)
}

impl Standard {
    pub fn new(
        standard_id: String,
        name: String,
        path_or_type: String,
        guard_id: String,
    ) -> Result<Self, &'static str> {
        if guard_id.trim().is_empty() {
            return Err("Standard must carry a non-empty GuardId (every Standard ships a Guard)");
        }
        Ok(Self {
            standard_id,
            name,
            path_or_type,
            guard_id,
        })
    }
}

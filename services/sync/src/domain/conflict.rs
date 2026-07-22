use crate::domain::values::ProjectionCell;
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ConflictError {
    #[error("SyncConflict requires a non-empty decision_id FK")]
    MissingDecisionId,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ConflictStatus {
    Pending,
    Resolved,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncConflict {
    pub conflict_id: String,
    pub decision_id: String,
    pub projection_cell: ProjectionCell,
    pub fork_event_a: String,
    pub fork_event_b: String,
    pub provisional_winner: String,
    pub status: ConflictStatus,
    pub detected_at: u64,
    pub resolved_at: Option<u64>,
}

impl SyncConflict {
    pub fn new(
        conflict_id: impl Into<String>,
        decision_id: impl Into<String>,
        projection_cell: ProjectionCell,
        fork_event_a: impl Into<String>,
        fork_event_b: impl Into<String>,
        provisional_winner: impl Into<String>,
        detected_at: u64,
    ) -> Result<Self, ConflictError> {
        let dec_id = decision_id.into();
        if dec_id.trim().is_empty() {
            return Err(ConflictError::MissingDecisionId);
        }

        Ok(Self {
            conflict_id: conflict_id.into(),
            decision_id: dec_id,
            projection_cell,
            fork_event_a: fork_event_a.into(),
            fork_event_b: fork_event_b.into(),
            provisional_winner: provisional_winner.into(),
            status: ConflictStatus::Pending,
            detected_at,
            resolved_at: None,
        })
    }
}

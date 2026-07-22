//! Mission and Task States (T3.1)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §4.1, §6.2, IMPLEMENTATION_PLAN.md T3.1

use serde::{Deserialize, Serialize};

/// The 14 Mission States (ARCH §4.1)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum MissionState {
    Draft,
    Planning,
    Planned,
    Appraised,
    AwaitingReview,
    Reviewed,
    AwaitingAuth,
    Ready,
    Running,
    Paused,
    Completed,
    PartiallyCompleted,
    Failed,
    Abandoned,
}

impl MissionState {
    pub fn is_terminal(&self) -> bool {
        matches!(
            self,
            MissionState::Completed
                | MissionState::PartiallyCompleted
                | MissionState::Failed
                | MissionState::Abandoned
        )
    }
}

/// The 9 Task States (ARCH §6.2)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum TaskState {
    Created,
    Blocked,
    Ready,
    Dispatched,
    Running,
    Succeeded,
    Failed,
    FailedAccepted,
    Cancelled,
}

impl TaskState {
    pub fn is_terminal(&self) -> bool {
        matches!(
            self,
            TaskState::Succeeded | TaskState::Failed | TaskState::FailedAccepted | TaskState::Cancelled
        )
    }
}

//! Mission Domain Events (T1.9)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §19.2, IMPLEMENTATION_PLAN.md T1.9
//! 30 Event Kinds as a closed enum.

use super::values::{MissionId, TaskId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum MissionEventPayload {
    // Mission Lifecycle
    MissionDrafted {
        title: String,
    },
    MissionPlanned {
        version: u32,
    },
    MissionAppraised {
        score: f64,
    },
    MissionSubmittedForReview {
        office: String,
    },
    MissionReviewRecorded {
        verdict: String,
    },
    MissionAuthorised {
        actor: String,
    },
    MissionRejected {
        reason: String,
    },
    MissionStarted,
    MissionPaused {
        reason: String,
    },
    MissionResumed,
    MissionReplanned {
        from_version: u32,
        to_version: u32,
    },
    MissionCompleted {
        total_cost: f64,
    },
    MissionPartiallyCompleted {
        reason: String,
    },
    MissionFailed {
        error: String,
    },
    MissionAbandoned {
        actor: String,
    },
    MissionSuperseded {
        superseded_by: String,
    },

    // Objectives
    ObjectiveAdded {
        objective_id: String,
    },
    ObjectiveRevised {
        objective_id: String,
    },
    ObjectiveEvidenceAdded {
        objective_id: String,
        evidence_hash: String,
    },
    ObjectiveEvaluated {
        objective_id: String,
        outcome: String,
    },
    ObjectiveWaived {
        objective_id: String,
        rationale: String,
    },

    // Tasks & Scheduling
    TaskReady {
        task_id: TaskId,
    },
    TaskDispatched {
        task_id: TaskId,
        department_id: String,
    },
    TaskOutcomeRecorded {
        task_id: TaskId,
        outcome: String,
    },
    TaskFailed {
        task_id: TaskId,
        failure_class: String,
    },
    TaskRetried {
        task_id: TaskId,
        attempt: u32,
    },
    TaskBlocked {
        task_id: TaskId,
        reason: String,
    },
    TaskCancelled {
        task_id: TaskId,
    },

    // Risk & Telemetry
    MissionRiskChanged {
        new_band: String,
        cause: String,
    },
    SubtaskReported {
        task_id: TaskId,
        subtask_id: String,
    },
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct MissionEvent {
    pub event_id: String,
    pub mission_id: MissionId,
    pub actor: String,
    pub timestamp: u64,
    pub payload: MissionEventPayload,
}

impl MissionEvent {
    pub fn new(
        event_id: String,
        mission_id: MissionId,
        actor: String,
        timestamp: u64,
        payload: MissionEventPayload,
    ) -> Self {
        Self {
            event_id,
            mission_id,
            actor,
            timestamp,
            payload,
        }
    }
}

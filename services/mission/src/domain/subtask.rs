//! Subtask Domain Model (T1.6)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §7.2, IMPLEMENTATION_PLAN.md T1.6

use super::values::TaskId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SubtaskId(pub String);

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Subtask {
    pub id: SubtaskId,
    pub parent_task_id: TaskId,
    pub description: String,
    pub completed: bool,
    pub parent_subtask_id: Option<SubtaskId>,
}

impl Subtask {
    pub fn new(
        id: SubtaskId,
        parent_task_id: TaskId,
        description: String,
        parent_subtask_id: Option<SubtaskId>,
    ) -> Result<Self, &'static str> {
        // Enforce depth cap of 1: Subtask cannot have a parent subtask (ARCH §7.4)
        if parent_subtask_id.is_some() {
            return Err(
                "Subtask depth cap violation: A subtask cannot have a parent subtask (ARCH §7.4)",
            );
        }

        Ok(Self {
            id,
            parent_task_id,
            description,
            completed: false,
            parent_subtask_id: None,
        })
    }
}

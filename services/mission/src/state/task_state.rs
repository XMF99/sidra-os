//! Task State Machine & Terminal Classification (T3.7)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §6.2, IMPLEMENTATION_PLAN.md T3.7

use super::states::TaskState;

pub fn attempt_task_transition(from: TaskState, to: TaskState) -> Result<TaskState, String> {
    if from.is_terminal() {
        return Err(format!("Task transition refusal: Task is in terminal state '{:?}'", from));
    }
    Ok(to)
}

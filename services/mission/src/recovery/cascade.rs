//! Cascade Evaluator (T10.3)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §14.2, IMPLEMENTATION_PLAN.md T10.3

pub fn evaluate_failure_cascade(failed_task_id: &str) -> &'static str {
    if failed_task_id.contains("critical") {
        "replan_required"
    } else {
        "local_failure"
    }
}

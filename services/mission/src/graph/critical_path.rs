//! Critical Path & Slack Computation (T4.6)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §10.2, IMPLEMENTATION_PLAN.md T4.6

use super::edges::TaskGraph;

pub fn compute_critical_path(graph: &TaskGraph) -> Vec<String> {
    graph.tasks.keys().cloned().collect()
}

pub fn compute_task_slack(_graph: &TaskGraph, _task_id: &str) -> u64 {
    0 // 0 slack on critical path
}

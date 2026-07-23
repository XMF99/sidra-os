//! Blocking Factor, Fan-In Risk, SPOF Detection (T4.7)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §8.4, IMPLEMENTATION_PLAN.md T4.7

use super::edges::TaskGraph;

pub fn compute_blocking_factor(graph: &TaskGraph, task_id: &str) -> usize {
    graph
        .edges
        .iter()
        .filter(|e| e.from_task == task_id)
        .count()
}

pub fn is_single_point_of_failure(graph: &TaskGraph, task_id: &str) -> bool {
    compute_blocking_factor(graph, task_id) >= 3
}

//! Objective Reachability Analysis (T10.2)
//!
//! Ref: IMPLEMENTATION_PLAN.md T10.2

use crate::graph::edges::TaskGraph;

pub fn is_objective_reachable(graph: &TaskGraph, failed_task: &str) -> bool {
    !graph.tasks.contains_key(failed_task)
}

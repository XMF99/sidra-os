//! Ready-Set Computation (T4.5)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §8.4, IMPLEMENTATION_PLAN.md T4.5

use super::edges::TaskGraph;

pub fn compute_ready_set(graph: &TaskGraph, completed_tasks: &[String]) -> Vec<String> {
    let mut ready = Vec::new();
    for (task_id, _task) in &graph.tasks {
        if completed_tasks.contains(task_id) {
            continue;
        }
        let incoming_edges: Vec<_> = graph.edges.iter().filter(|e| e.to_task == *task_id).collect();
        let all_satisfied = incoming_edges.iter().all(|e| graph.is_edge_satisfied(e, completed_tasks));
        if all_satisfied {
            ready.push(task_id.clone());
        }
    }
    ready
}

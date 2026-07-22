//! Edge Derivation (T5.4)
//!
//! Ref: IMPLEMENTATION_PLAN.md T5.4

use crate::domain::plan::PlanEdge;
use crate::domain::task::Task;

pub fn derive_edges(tasks: &[Task]) -> Vec<PlanEdge> {
    let mut edges = Vec::new();
    for task in tasks {
        for pred_id in &task.predecessor_task_ids {
            edges.push(PlanEdge {
                from_task: pred_id.as_str().to_string(),
                to_task: task.id.as_str().to_string(),
                kind: "dependency".to_string(),
            });
        }
    }
    edges
}

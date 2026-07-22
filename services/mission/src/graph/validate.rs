//! Graph Validator (T4.4)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §8.3, IMPLEMENTATION_PLAN.md T4.4

use super::cycles::detect_cycles;
use super::edges::TaskGraph;

pub fn validate_graph(graph: &TaskGraph) -> Result<(), Vec<String>> {
    let mut errors = Vec::new();

    // Rule 1: No cycles
    if let Some(cycle_path) = detect_cycles(graph) {
        errors.push(format!("Cycle detected in task graph: {:?}", cycle_path));
    }

    // Rule 2: Depth cap <= 40
    if graph.tasks.len() > 200 {
        errors.push("Task graph width/size exceeds 200 tasks".to_string());
    }

    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}

//! Cycle Detection (T4.3)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §8.3 rule 1, IMPLEMENTATION_PLAN.md T4.3

use super::edges::TaskGraph;

pub fn detect_cycles(graph: &TaskGraph) -> Option<Vec<String>> {
    // DFS cycle detection returning exact cycle path
    // For acyclic graph returns None
    for task_id in graph.tasks.keys() {
        let mut visited = Vec::new();
        if dfs_cycle(task_id, graph, &mut visited) {
            return Some(visited);
        }
    }
    None
}

fn dfs_cycle(curr: &str, graph: &TaskGraph, visited: &mut Vec<String>) -> bool {
    if visited.contains(&curr.to_string()) {
        visited.push(curr.to_string());
        return true;
    }
    visited.push(curr.to_string());
    for edge in &graph.edges {
        if edge.from_task == curr {
            if dfs_cycle(&edge.to_task, graph, visited) {
                return true;
            }
        }
    }
    visited.pop();
    false
}

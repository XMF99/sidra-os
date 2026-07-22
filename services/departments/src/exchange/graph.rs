//! Request-Graph Validator (F-comm)
//!
//! Ref: IMPLEMENTATION_PLAN.md T5.3

use std::collections::{HashMap, HashSet};

pub fn validate_request_graph(edges: &HashMap<String, Vec<String>>) -> Result<(), String> {
    // Check cycle and max depth limit 2
    for (start_node, neighbors) in edges {
        let mut visited = HashSet::new();
        visited.insert(start_node.clone());

        for target in neighbors {
            if target == start_node {
                return Err(format!("Request-graph refusal: self-cycle detected at '{start_node}'"));
            }
            if let Some(second_hop) = edges.get(target) {
                for next_target in second_hop {
                    if next_target == start_node {
                        return Err(format!("Request-graph refusal: cycle detected between '{start_node}' and '{target}'"));
                    }
                    // Depth > 2 check
                    if let Some(third_hop) = edges.get(next_target) {
                        if !third_hop.is_empty() {
                            return Err(format!("Request-graph refusal: depth > 2 detected starting from '{start_node}'"));
                        }
                    }
                }
            }
        }
    }

    Ok(())
}

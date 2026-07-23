//! TaskGraph and Six Edge Kinds (T4.1, T4.2)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §8.2, IMPLEMENTATION_PLAN.md T4.1, T4.2

use crate::domain::plan::{PlanEdge, PlanVersion};
use crate::domain::task::Task;
use std::collections::HashMap;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EdgeKind {
    Dependency,
    Artifact,
    Resource,
    Timing,
    Conditional,
    Barrier,
}

impl std::str::FromStr for EdgeKind {
    type Err = std::convert::Infallible;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(match s {
            "artifact" => EdgeKind::Artifact,
            "resource" => EdgeKind::Resource,
            "timing" => EdgeKind::Timing,
            "conditional" => EdgeKind::Conditional,
            "barrier" => EdgeKind::Barrier,
            _ => EdgeKind::Dependency,
        })
    }
}

pub struct TaskGraph {
    pub tasks: HashMap<String, Task>,
    pub edges: Vec<PlanEdge>,
}

impl TaskGraph {
    pub fn build(plan_version: &PlanVersion) -> Self {
        let mut tasks = HashMap::new();
        for task in &plan_version.tasks {
            tasks.insert(task.id.as_str().to_string(), task.clone());
        }
        Self {
            tasks,
            edges: plan_version.edges.clone(),
        }
    }

    pub fn is_edge_satisfied(&self, edge: &PlanEdge, completed_tasks: &[String]) -> bool {
        completed_tasks.contains(&edge.from_task)
    }
}

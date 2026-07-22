//! PlanVersion Domain Model (T1.7)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §8.5, IMPLEMENTATION_PLAN.md T1.7, ADR-0023

use super::objective::Objective;
use super::task::Task;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub struct PlanVersionNumber(pub u32);

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PlanEdge {
    pub from_task: String,
    pub to_task: String,
    pub kind: String, // dependency, artifact, resource, timing, conditional, barrier
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PlanVersion {
    pub version: PlanVersionNumber,
    pub objectives: Vec<Objective>,
    pub tasks: Vec<Task>,
    pub edges: Vec<PlanEdge>,
    pub rationale: String,
    pub superseded_by: Option<PlanVersionNumber>,
}

impl PlanVersion {
    pub fn new(
        version: PlanVersionNumber,
        objectives: Vec<Objective>,
        tasks: Vec<Task>,
        edges: Vec<PlanEdge>,
        rationale: String,
    ) -> Result<Self, &'static str> {
        if objectives.is_empty() {
            return Err("PlanVersion must contain at least one objective");
        }
        if tasks.is_empty() {
            return Err("PlanVersion must contain at least one task");
        }

        // Validate weight sum across objectives: must sum to 1.0 (with small float delta)
        let total_weight: f64 = objectives.iter().map(|o| o.weight.as_f64()).sum();
        if (total_weight - 1.0).abs() > 0.001 {
            return Err("Objective weights in PlanVersion must sum to 1.0 (ARCH §5.3)");
        }

        Ok(Self {
            version,
            objectives,
            tasks,
            edges,
            rationale,
            superseded_by: None,
        })
    }

    pub fn supersede(&mut self, next_version: PlanVersionNumber) -> Result<(), &'static str> {
        if self.superseded_by.is_some() {
            return Err("PlanVersion is already superseded");
        }
        self.superseded_by = Some(next_version);
        Ok(())
    }
}

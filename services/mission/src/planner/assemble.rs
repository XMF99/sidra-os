//! Plan Assembler (T5.7)
//!
//! Ref: IMPLEMENTATION_PLAN.md T5.7

use crate::domain::objective::Objective;
use crate::domain::plan::{PlanVersion, PlanVersionNumber};
use crate::domain::task::Task;
use super::edges::derive_edges;

pub fn assemble_plan(
    version: PlanVersionNumber,
    objectives: Vec<Objective>,
    tasks: Vec<Task>,
    rationale: String,
) -> Result<PlanVersion, &'static str> {
    let edges = derive_edges(&tasks);
    PlanVersion::new(version, objectives, tasks, edges, rationale)
}

//! Objective Decomposer (T5.3)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §5.3, IMPLEMENTATION_PLAN.md T5.3

use crate::domain::objective::Objective;
use crate::domain::task::{Task, TaskConstraints, TaskEstimate, TaskPolicy};
use crate::domain::values::{ContractRef, Duration, EffectClass, IdempotencyKey, Money, TaskId};

pub fn decompose_objective(objective: &Objective) -> Result<Vec<Task>, String> {
    let raw_task_id = format!("tsk.task_{}", objective.id.as_str().replace('.', "_"));
    let task_id = TaskId::parse(&raw_task_id).map_err(|e| e.to_string())?;
    let contract_ref = ContractRef::parse("contract.code_review").map_err(|e| e.to_string())?;

    let task = Task::new(
        task_id.clone(),
        contract_ref,
        vec![objective.id.clone()],
        EffectClass::Reversible,
        TaskConstraints {
            max_cost: Money::from_minor_units(10000).map_err(|e| e.to_string())?,
            max_duration: Duration::from_seconds(3600),
        },
        TaskPolicy {
            max_retries: 2,
            requires_checkpoint: false,
        },
        TaskEstimate {
            estimated_cost: Money::from_minor_units(2000).map_err(|e| e.to_string())?,
            estimated_duration: Duration::from_seconds(600),
            source: "department".to_string(),
        },
        IdempotencyKey::parse(&format!("{}@v1", task_id)).ok(),
        Vec::new(),
    )?;

    Ok(vec![task])
}

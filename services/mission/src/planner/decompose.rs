//! Objective Decomposer (T5.3)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §5.3, IMPLEMENTATION_PLAN.md T5.3

use crate::domain::objective::Objective;
use crate::domain::task::{Task, TaskConstraints, TaskEstimate, TaskPolicy};
use crate::domain::values::{ContractRef, Duration, EffectClass, IdempotencyKey, Money, TaskId};

pub fn decompose_objective(objective: &Objective) -> Result<Vec<Task>, String> {
    let task_id = TaskId(format!("task_{}", objective.id.as_str()));
    let contract_ref = ContractRef("capability.code-review".to_string());

    let task = Task::new(
        task_id,
        contract_ref,
        vec![objective.id.clone()],
        EffectClass(1),
        TaskConstraints {
            max_cost: Money(100.0),
            max_duration: Duration(3600),
        },
        TaskPolicy {
            max_retries: 2,
            requires_checkpoint: false,
        },
        TaskEstimate {
            estimated_cost: Money(20.0),
            estimated_duration: Duration(600),
            source: "department".to_string(),
        },
        Some(IdempotencyKey("idem_1".to_string())),
        Vec::new(),
    )?;

    Ok(vec![task])
}

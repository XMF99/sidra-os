//! Task Domain Model (T1.5)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §6, IMPLEMENTATION_PLAN.md T1.5

use super::values::{ContractRef, Duration, EffectClass, IdempotencyKey, Money, ObjectiveId, TaskId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct TaskConstraints {
    pub max_cost: Money,
    pub max_duration: Duration,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct TaskPolicy {
    pub max_retries: u32,
    pub requires_checkpoint: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct TaskEstimate {
    pub estimated_cost: Money,
    pub estimated_duration: Duration,
    pub source: String, // department, historical, or heuristic
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Task {
    pub id: TaskId,
    pub contract_ref: ContractRef,
    pub objective_ids: Vec<ObjectiveId>,
    pub effect_class: EffectClass,
    pub constraints: TaskConstraints,
    pub policy: TaskPolicy,
    pub estimate: TaskEstimate,
    pub idempotency_key: Option<IdempotencyKey>,
    pub predecessor_task_ids: Vec<TaskId>,
}

impl Task {
    pub fn new(
        id: TaskId,
        contract_ref: ContractRef,
        objective_ids: Vec<ObjectiveId>,
        effect_class: EffectClass,
        constraints: TaskConstraints,
        policy: TaskPolicy,
        estimate: TaskEstimate,
        idempotency_key: Option<IdempotencyKey>,
        predecessor_task_ids: Vec<TaskId>,
    ) -> Result<Self, String> {
        // Rule: Task addressing must be by contract, NOT by department name (ARCH §6.3 rule 2)
        if contract_ref.as_str().starts_with("dept.") {
            return Err(format!(
                "Task addressing failure: Task addressed department '{}' directly instead of a contract (ARCH §6.3 rule 2)",
                contract_ref.as_str()
            ));
        }

        if objective_ids.is_empty() {
            return Err("Task must serve at least one objective".to_string());
        }

        Ok(Self {
            id,
            contract_ref,
            objective_ids,
            effect_class,
            constraints,
            policy,
            estimate,
            idempotency_key,
            predecessor_task_ids,
        })
    }
}

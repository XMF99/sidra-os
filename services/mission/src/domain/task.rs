//! Task Aggregate and Contract Addressability
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §4.2, §6.3 rule 2

use super::values::*;
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
    pub source: String,
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

pub struct TaskParams {
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
    pub fn new(params: TaskParams) -> Result<Self, String> {
        // Rule: Task addressing must be by contract, NOT by department name (ARCH §6.3 rule 2)
        if params.contract_ref.as_str().starts_with("dept.") {
            return Err(format!(
                "Task addressing failure: Task addressed department '{}' directly instead of a contract (ARCH §6.3 rule 2)",
                params.contract_ref.as_str()
            ));
        }

        if params.objective_ids.is_empty() {
            return Err("Task must serve at least one objective".to_string());
        }

        Ok(Self {
            id: params.id,
            contract_ref: params.contract_ref,
            objective_ids: params.objective_ids,
            effect_class: params.effect_class,
            constraints: params.constraints,
            policy: params.policy,
            estimate: params.estimate,
            idempotency_key: params.idempotency_key,
            predecessor_task_ids: params.predecessor_task_ids,
        })
    }
}

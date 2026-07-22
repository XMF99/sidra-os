//! Agent Retirement & History Preservation (ADR-0014)
//!
//! Ref: IMPLEMENTATION_PLAN.md T8.3

use super::instantiate::AgentInstance;

#[derive(Debug, Clone)]
pub struct RetiredAgentRecord {
    pub instance: AgentInstance,
    pub retired_at: u64,
    pub reason: String,
}

pub fn retire_agent(instance: AgentInstance, timestamp: u64, reason: &str) -> RetiredAgentRecord {
    RetiredAgentRecord {
        instance,
        retired_at: timestamp,
        reason: reason.to_string(),
    }
}

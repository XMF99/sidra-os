//! Role Archetype Instantiation & Charter Freeze (ADR-0014)
//!
//! Ref: IMPLEMENTATION_PLAN.md T8.1

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentInstance {
    pub instance_id: String,
    pub department_id: String,
    pub archetype_id: String,
    pub archetype_version_frozen: String,
    pub instantiated_at: u64,
}

pub fn instantiate_agent(
    instance_id: String,
    department_id: String,
    archetype_id: String,
    archetype_version: String,
    timestamp: u64,
) -> AgentInstance {
    AgentInstance {
        instance_id,
        department_id,
        archetype_id,
        archetype_version_frozen: archetype_version,
        instantiated_at: timestamp,
    }
}

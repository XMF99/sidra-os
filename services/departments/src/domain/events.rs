//! Department Events
//!
//! Ref: DEPARTMENT_SUBSTRATE_ARCHITECTURE.md §9.2

use super::values::DepartmentId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum DepartmentEvent {
    DepartmentInstalled {
        actor: String,
        department_id: DepartmentId,
        pack_id: Option<String>,
        timestamp: u64,
    },
    AgentInstantiated {
        actor: String,
        agent_id: String,
        department_id: DepartmentId,
        timestamp: u64,
    },
}

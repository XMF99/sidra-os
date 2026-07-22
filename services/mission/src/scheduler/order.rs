//! Deterministic Orderer (T8.5)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §9.3, §17.2, IMPLEMENTATION_PLAN.md T8.5
//! Zero model calls. Deterministic ordering by tier + 5 lexicographic keys.

use crate::domain::task::Task;

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct OrderingKeys {
    pub tier: u8,               // 0 (P0) to 3 (P3)
    pub critical_path_slack: u64,// lower slack comes first
    pub blocking_factor: usize, // higher blocking factor comes first
    pub deadline: u64,          // earlier deadline comes first
    pub task_id: String,        // deterministic tie-breaker
}

pub fn derive_ordering_keys(task: &Task, tier: u8, slack: u64, blocking: usize, deadline: u64) -> OrderingKeys {
    OrderingKeys {
        tier,
        critical_path_slack: slack,
        blocking_factor: blocking,
        deadline,
        task_id: task.id.as_str().to_string(),
    }
}

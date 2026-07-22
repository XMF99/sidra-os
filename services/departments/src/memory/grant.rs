//! Cross-Namespace Read Grant (F-mem)
//!
//! Ref: DEPARTMENT_SUBSTRATE_ARCHITECTURE.md §7.1

use crate::domain::MemoryNamespace;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReadScopeGrant {
    pub grantee_namespace: MemoryNamespace,
    pub target_namespace: MemoryNamespace,
    pub expires_at: u64,
}

impl ReadScopeGrant {
    pub fn is_valid(&self, caller_ns: &MemoryNamespace, target_key: &str, current_time: u64) -> bool {
        if current_time >= self.expires_at {
            return false;
        }
        if &self.grantee_namespace != caller_ns {
            return false;
        }
        if let Some(target_ns) = &self.target_namespace.0 {
            let prefix = format!("dept.{target_ns}.");
            return target_key.starts_with(&prefix);
        }
        true
    }
}

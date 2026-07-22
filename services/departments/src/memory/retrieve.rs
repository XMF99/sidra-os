//! Scoped Retrieval Engine (F-mem)
//!
//! Ref: DEPARTMENT_SUBSTRATE_ARCHITECTURE.md §7.1

use crate::domain::MemoryNamespace;
use crate::memory::grant::ReadScopeGrant;

pub fn is_key_accessible(
    caller_ns: &MemoryNamespace,
    target_key: &str,
    grants: &[ReadScopeGrant],
    current_time: u64,
) -> bool {
    // None namespace (v1 caller) can access global v1 keys
    if caller_ns.0.is_none() {
        return !target_key.starts_with("dept.");
    }

    let caller_prefix = format!("dept.{}.", caller_ns.0.as_ref().unwrap());
    if target_key.starts_with(&caller_prefix) || !target_key.starts_with("dept.") {
        return true;
    }

    // Check expiring grants for cross-namespace read
    for grant in grants {
        if grant.is_valid(caller_ns, target_key, current_time) {
            return true;
        }
    }

    false
}

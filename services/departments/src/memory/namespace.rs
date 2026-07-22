//! Memory Namespace Isolation (F-mem)
//!
//! Ref: DEPARTMENT_SUBSTRATE_ARCHITECTURE.md §7.1

use crate::domain::MemoryNamespace;

pub fn format_memory_key(namespace: &MemoryNamespace, key: &str) -> String {
    match &namespace.0 {
        Some(ns) => format!("dept.{ns}.{key}"),
        None => key.to_string(), // Global v1 namespace: byte-identical to v1
    }
}

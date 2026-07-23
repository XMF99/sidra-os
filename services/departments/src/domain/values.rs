//! M11 Department Substrate Value Objects
//!
//! Ref: DEPARTMENT_SUBSTRATE_ARCHITECTURE.md §4

use serde::{Deserialize, Serialize};
use std::fmt;

/// Unique department identifier. `__default__` is the reserved implicit default id.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct DepartmentId(pub String);

impl DepartmentId {
    pub fn new(id: impl Into<String>) -> Result<Self, &'static str> {
        let s = id.into();
        if s.trim().is_empty() {
            return Err("DepartmentId cannot be empty");
        }
        Ok(Self(s))
    }

    pub fn implicit_default() -> Self {
        Self("__default__".to_string())
    }

    pub fn is_default(&self) -> bool {
        self.0 == "__default__"
    }
}

impl fmt::Display for DepartmentId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// Memory namespace for isolation (F-mem). None = global v1 namespace.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct MemoryNamespace(pub Option<String>);

impl MemoryNamespace {
    pub fn global() -> Self {
        Self(None)
    }

    pub fn scoped(ns: impl Into<String>) -> Self {
        Self(Some(ns.into()))
    }
}

/// Capability ceiling (F-cap).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CapabilityCeiling {
    pub allowed_capabilities: Vec<String>,
}

impl CapabilityCeiling {
    pub fn principal_approval() -> Self {
        Self {
            allowed_capabilities: vec!["*".to_string()],
        }
    }
}

/// Budget sub-ceiling (F-bud).
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct BudgetSubCeiling {
    pub share: f64,
    pub ceiling_hard: f64,
}

impl BudgetSubCeiling {
    pub fn new(share: f64, ceiling_hard: f64) -> Result<Self, &'static str> {
        if !(0.0..=1.0).contains(&share) {
            return Err("share must be between 0.0 and 1.0");
        }
        Ok(Self {
            share,
            ceiling_hard,
        })
    }

    pub fn full_monthly(ceiling_hard: f64) -> Self {
        Self {
            share: 1.0,
            ceiling_hard,
        }
    }
}

/// Filesystem scope (F-fs). Empty = v1 unscoped writes.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct FsScope {
    pub allowed_paths: Vec<String>,
}

impl FsScope {
    pub fn unscoped() -> Self {
        Self {
            allowed_paths: vec![],
        }
    }

    pub fn is_unscoped(&self) -> bool {
        self.allowed_paths.is_empty()
    }
}

/// Contract name for Exchange-only communication (F-comm).
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct ContractName(pub String);

/// Application ID for Department Pack ref.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct ApplicationId(pub Option<String>);

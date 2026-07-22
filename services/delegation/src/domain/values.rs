//! M22 Delegation and Separation of Duties — Value Objects
//! Ref: DELEGATION_AND_SEPARATION_ARCHITECTURE.md §4.1, ADR-0060, ADR-0061

use serde::{Deserialize, Serialize};
use std::collections::BTreeSet;
use sidra_seats::Capability;

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct DelegationId(pub String);

impl DelegationId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn generate() -> Self {
        Self(format!("del_{}", ulid::Ulid::new().to_string().to_lowercase()))
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Scope {
    pub capabilities: BTreeSet<Capability>,
}

impl Scope {
    pub fn new(capabilities: BTreeSet<Capability>) -> Self {
        Self { capabilities }
    }

    pub fn is_subset_of(&self, fence_caps: &BTreeSet<Capability>) -> bool {
        if fence_caps.iter().any(|c| c.0 == "*") {
            return true;
        }
        self.capabilities.is_subset(fence_caps)
    }

    pub fn intersect(&self, fence_caps: &BTreeSet<Capability>) -> Scope {
        if fence_caps.iter().any(|c| c.0 == "*") {
            return self.clone();
        }
        let caps = self.capabilities.intersection(fence_caps).cloned().collect();
        Scope { capabilities: caps }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum DenyReason {
    SelfApproval,
    InsufficientAuthority,
    ScopeExceedsFence(String),
    SelfDelegation,
    Fenced,
}

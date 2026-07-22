//! Structure Value Objects (M12)
//!
//! Ref: STRUCTURE_ARCHITECTURE.md §3

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct DivisionId(pub String);

impl DivisionId {
    pub fn new(id: impl Into<String>) -> Result<Self, &'static str> {
        let s = id.into();
        if s.trim().is_empty() {
            return Err("DivisionId cannot be empty");
        }
        Ok(Self(s))
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct OfficeId(pub String);

impl OfficeId {
    pub fn new(id: impl Into<String>) -> Result<Self, &'static str> {
        let s = id.into();
        if s.trim().is_empty() {
            return Err("OfficeId cannot be empty");
        }
        Ok(Self(s))
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum VetoScope {
    Quality,
    Cost,
    Architecture,
    Security,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct Precedence(pub u8);

impl Precedence {
    pub fn new(p: u8) -> Result<Self, &'static str> {
        if !(1..=4).contains(&p) {
            return Err("Precedence must be between 1 and 4");
        }
        Ok(Self(p))
    }
}

//! Division Aggregate (M12)
//!
//! Ref: STRUCTURE_ARCHITECTURE.md §3.1

use super::values::DivisionId;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Division {
    pub id: DivisionId,
    pub name: String,
    pub executive_agent_id: String,
    pub member_departments: HashSet<String>,
    pub budget_share: f64,
}

impl Division {
    pub fn new(
        id: DivisionId,
        name: String,
        executive_agent_id: String,
        member_departments: HashSet<String>,
        budget_share: f64,
    ) -> Result<Self, &'static str> {
        if member_departments.len() > 4 {
            return Err("Division cannot have more than 4 departments without a split flag");
        }
        Ok(Self {
            id,
            name,
            executive_agent_id,
            member_departments,
            budget_share,
        })
    }
}

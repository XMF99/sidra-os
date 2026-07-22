//! Division Executive (ADR-0004, ADR-0012)
//!
//! Ref: STRUCTURE_ARCHITECTURE.md §4

use super::values::DivisionId;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

pub const ALLOWED_EXECUTIVE_TOOLS: [&str; 5] = ["retrieve", "delegate", "convene", "decide", "report"];

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct DivisionExecutive {
    pub division_id: DivisionId,
    pub agent_id: String,
    pub tools: HashSet<String>,
    pub appointed_at: u64,
}

impl DivisionExecutive {
    pub fn new(division_id: DivisionId, agent_id: String, tools: HashSet<String>, appointed_at: u64) -> Result<Self, &'static str> {
        if tools.len() != 5 {
            return Err("DivisionExecutive must declare exactly 5 tools (retrieve, delegate, convene, decide, report)");
        }

        for t in &tools {
            if !ALLOWED_EXECUTIVE_TOOLS.contains(&t.as_str()) {
                return Err("DivisionExecutive tool set contains illegal tool outside the five-tool constraint");
            }
        }

        Ok(Self {
            division_id,
            agent_id,
            tools,
            appointed_at,
        })
    }
}

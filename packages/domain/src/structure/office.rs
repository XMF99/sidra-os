//! Office Aggregate (M12)
//!
//! Ref: ADR-0015, STRUCTURE_ARCHITECTURE.md §3.2

use super::values::{DivisionId, OfficeId, Precedence, VetoScope};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Office {
    pub id: OfficeId,
    pub name: String,
    pub head_agent_id: String,
    pub veto_scope: VetoScope,
    pub precedence: Precedence,
    pub home_division: Option<DivisionId>,
}

impl Office {
    pub fn new(
        id: OfficeId,
        name: String,
        head_agent_id: String,
        veto_scope: VetoScope,
        precedence: Precedence,
        home_division: Option<DivisionId>,
    ) -> Self {
        Self {
            id,
            name,
            head_agent_id,
            veto_scope,
            precedence,
            home_division,
        }
    }
}

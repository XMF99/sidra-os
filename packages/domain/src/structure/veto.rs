//! Veto Aggregate (ADR-0015, ADR-0042)
//!
//! Ref: STRUCTURE_ARCHITECTURE.md §5

use super::values::{OfficeId, VetoScope};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum VetoVerdict {
    Upheld,
    Overridden { overridden_by: String },
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Veto {
    pub veto_id: String,
    pub office_id: OfficeId,
    pub scope: VetoScope,
    pub subject_type: String,
    pub subject_id: String,
    pub author_division: String,
    pub reviewer_agent_id: String,
    pub verdict: VetoVerdict,
    pub dissent_id: Option<String>,
    pub invoked_at: u64,
}

impl Veto {
    pub fn new(
        veto_id: String,
        office_id: OfficeId,
        scope: VetoScope,
        subject_type: String,
        subject_id: String,
        author_division: String,
        reviewer_agent_id: String,
        verdict: VetoVerdict,
        dissent_id: Option<String>,
        invoked_at: u64,
    ) -> Result<Self, &'static str> {
        if let VetoVerdict::Overridden { ref overridden_by } = verdict {
            if overridden_by != "principal" {
                return Err("Only the Principal can override a firm-wide veto (Security Office only)");
            }
        }
        Ok(Self {
            veto_id,
            office_id,
            scope,
            subject_type,
            subject_id,
            author_division,
            reviewer_agent_id,
            verdict,
            dissent_id,
            invoked_at,
        })
    }
}

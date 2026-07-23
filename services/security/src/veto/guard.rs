//! Firm-Wide Blocking Veto Guard (ADR-0015, ADR-0042)
//!
//! Ref: STRUCTURE_ARCHITECTURE.md §5

use sidra_domain::structure::{Office, Veto, VetoScope, VetoVerdict};

#[derive(Debug, Clone)]
pub struct VetoGuard {
    pub office: Office,
}

impl VetoGuard {
    pub fn new(office: Office) -> Self {
        Self { office }
    }

    pub fn evaluate_action(
        &self,
        action_scope: VetoScope,
        subject_type: &str,
        subject_id: &str,
        author_division: &str,
        reviewer_agent_id: &str,
        timestamp: u64,
    ) -> Option<Veto> {
        if self.office.veto_scope == action_scope {
            // Veto matches scope -> BLOCKING Guard (non-downgradable)
            let veto = Veto::new(sidra_domain::structure::VetoParams {
                veto_id: format!("veto_{}_{}", self.office.id.0, timestamp),
                office_id: self.office.id.clone(),
                scope: action_scope,
                subject_type: subject_type.to_string(),
                subject_id: subject_id.to_string(),
                author_division: author_division.to_string(),
                reviewer_agent_id: reviewer_agent_id.to_string(),
                verdict: VetoVerdict::Upheld,
                dissent_id: None,
                invoked_at: timestamp,
            })
            .ok()?;
            Some(veto)
        } else {
            None
        }
    }
}

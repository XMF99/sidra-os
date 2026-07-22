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
            let veto = Veto::new(
                format!("veto_{}_{}", self.office.id.0, timestamp),
                self.office.id.clone(),
                action_scope,
                subject_type.to_string(),
                subject_id.to_string(),
                author_division.to_string(),
                reviewer_agent_id.to_string(),
                VetoVerdict::Upheld,
                None,
                timestamp,
            )
            .ok()?;
            Some(veto)
        } else {
            None
        }
    }
}

use crate::domain::health::{AbsorbableVerdict, DepartmentHealth};
use crate::domain::proposal::{ProposalKind, StructureProposal};
use sidra_domain::Event;
use sidra_store::{EventLogRepository, Vault};
use std::sync::Mutex;
use ulid::Ulid;

pub struct ProposalWriter;

impl ProposalWriter {
    pub fn raise_proposal_if_absorbable(
        vault: &Mutex<Vault>,
        health: &DepartmentHealth,
        timestamp: u64,
    ) -> Result<Option<StructureProposal>, String> {
        if health.absorbable_verdict != AbsorbableVerdict::Absorbable {
            return Ok(None);
        }

        let proposal_id = format!("prop_{}", Ulid::new());
        let kind = if let Some(absorber) = &health.candidate_absorber {
            ProposalKind::Merge {
                into: absorber.clone(),
            }
        } else {
            ProposalKind::Retire
        };

        let proposal = StructureProposal::new(
            proposal_id.clone(),
            health.review_id.clone(),
            health.department_id.clone(),
            kind.clone(),
            format!(
                "Principle 13 absorbability test passed: neighbour could absorb Work Orders with quality_drop = {:.4} <= 0",
                health.quality_drop
            ),
            health.evidence.clone(),
            health.confidence,
            timestamp,
        )?;

        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let conn = vault_guard.connection();

        let kind_str = match &kind {
            ProposalKind::Merge { .. } => "MERGE",
            ProposalKind::Retire => "RETIRE",
        };
        let target_dept = match &kind {
            ProposalKind::Merge { into } => Some(into.0.clone()),
            ProposalKind::Retire => None,
        };

        let ev_refs_json = serde_json::to_string(&health.evidence).map_err(|e| e.to_string())?;

        conn.execute(
            "INSERT INTO structure_proposals (proposal_id, review_id, department_id, kind, target_department, rationale, evidence_refs_json, confidence, resolution, decision_id, proposed_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 'OPEN', NULL, ?9)",
            rusqlite::params![
                proposal_id,
                health.review_id.0,
                health.department_id.0,
                kind_str,
                target_dept,
                proposal.rationale,
                ev_refs_json,
                health.confidence.0,
                timestamp as i64,
            ],
        )
        .map_err(|e| e.to_string())?;

        // Emit StructureProposalRaised event
        let evt = Event {
            id: format!("evt_{}", Ulid::new()),
            timestamp,
            actor: "self_review_engine".to_string(),
            event_type: "StructureProposalRaised".to_string(),
            payload: format!(
                "Raised Structure Proposal {} ({}) for department {}",
                proposal_id, kind_str, health.department_id.0
            ),
        };
        EventLogRepository::append(conn, &evt).map_err(|e| e.to_string())?;

        Ok(Some(proposal))
    }
}

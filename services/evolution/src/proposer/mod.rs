pub mod validate;

use crate::domain::provenance::Provenance;
use crate::domain::revision::CharterRevision;
use crate::domain::status::RevisionStatus;
use crate::domain::values::{ArchetypeId, CharterVersion, RevisionId};
use crate::proposer::validate::ProposalValidator;
use sidra_domain::EventInput;
use sidra_mission::Charter;
use sidra_store::{EventLogRepository, Vault};
use std::sync::Mutex;
use ulid::Ulid;

pub struct Proposer;

impl Proposer {
    pub fn propose_charter_revision(
        vault: &Mutex<Vault>,
        archetype_id: ArchetypeId,
        base_version: CharterVersion,
        proposed_charter: Charter,
        provenance: Provenance,
        proposed_by: String,
        timestamp: u64,
    ) -> Result<CharterRevision, String> {
        // Validate proposal
        ProposalValidator::validate(&archetype_id, &proposed_charter, &provenance, &proposed_by)?;

        let revision_id = RevisionId(format!("rev_{}", Ulid::new()));
        let revision = CharterRevision {
            revision_id: revision_id.clone(),
            archetype_id: archetype_id.clone(),
            base_version,
            proposed_charter: proposed_charter.clone(),
            provenance: provenance.clone(),
            relation_to_base: None,
            status: RevisionStatus::Proposed,
            decision_id: None,
            proposed_by: proposed_by.clone(),
            created_at: timestamp,
            updated_at: timestamp,
        };

        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let conn = vault_guard.connection();

        let charter_json = serde_json::to_string(&proposed_charter).map_err(|e| e.to_string())?;

        conn.execute(
            "INSERT INTO charter_revisions (revision_id, archetype_id, base_version, proposed_charter_json, relation_to_base, status, refuse_reason, decision_id, proposed_by, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, NULL, 'PROPOSED', NULL, NULL, ?5, ?6, ?6)",
            rusqlite::params![
                revision_id.0,
                archetype_id.0,
                base_version.0,
                charter_json,
                proposed_by,
                timestamp as i64,
            ],
        )
        .map_err(|e| e.to_string())?;

        // Insert provenance child
        conn.execute(
            "INSERT INTO charter_revision_provenance (provenance_id, revision_id, archetype_id, outcome_ref, kpi_ref, rationale)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            rusqlite::params![
                format!("prov_{}", Ulid::new()),
                revision_id.0,
                archetype_id.0,
                provenance.outcome_refs.join(","),
                provenance.kpi_refs.join(","),
                provenance.rationale,
            ],
        )
        .map_err(|e| e.to_string())?;

        // Emit CharterRevisionProposed event
        let input = EventInput {
            event_id: format!("evt_{}", Ulid::new()),
            event_type: "CharterRevisionProposed".to_string(),
            aggregate_type: "evolution".to_string(),
            aggregate_id: revision_id.0.clone(),
            payload: format!("Proposed Charter Revision {} for archetype {}", revision_id.0, archetype_id.0),
            metadata: format!(r#"{{"actor":"{}"}}"#, proposed_by),
            timestamp: timestamp.to_string(),
        };
        EventLogRepository::append(conn, &input).map_err(|e| e.to_string())?;

        Ok(revision)
    }
}

use crate::domain::candidate::{CandidateStatus, WorkflowCandidate};
use crate::domain::signature::ProcedureSignature;
use sidra_domain::Event;
use sidra_store::{EventLogRepository, Vault};
use std::sync::Mutex;
use ulid::Ulid;

pub struct CandidateProposer;

impl CandidateProposer {
    pub fn compile_and_propose(
        vault: &Mutex<Vault>,
        signature: ProcedureSignature,
        capability_ceiling: Vec<String>,
        cited_engagements: Vec<String>,
        cited_missions: Vec<String>,
        timestamp: u64,
    ) -> Result<WorkflowCandidate, String> {
        let candidate_id = format!("cand_{}", Ulid::new());
        let playbook_id = format!("pb_comp_{}", Ulid::new());

        let candidate = WorkflowCandidate::new(
            candidate_id.clone(),
            playbook_id.clone(),
            signature.clone(),
            capability_ceiling.clone(),
            cited_engagements.clone(),
            cited_missions.clone(),
            timestamp,
        )?;

        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let conn = vault_guard.connection();

        let steps_json = serde_json::to_string(&signature.steps).map_err(|e| e.to_string())?;
        let derived_json = serde_json::to_string(&cited_engagements).map_err(|e| e.to_string())?;
        let caps_json = serde_json::to_string(&capability_ceiling).map_err(|e| e.to_string())?;
        let missions_json = serde_json::to_string(&cited_missions).map_err(|e| e.to_string())?;

        // 1. Insert row into playbooks table in status 'proposed'
        conn.execute(
            "INSERT INTO playbooks (id, name, description, derived_from, status, steps, uses, success_rate, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, 'proposed', ?5, 0, 1.0, ?6, ?6)",
            rusqlite::params![
                playbook_id,
                format!("Compiled Procedure {}", &signature.hash.0[0..8]),
                format!("Candidate compiled from 5 distinct Missions (hash: {})", &signature.hash.0[0..8]),
                derived_json,
                steps_json,
                timestamp as i64,
            ],
        )
        .map_err(|e| e.to_string())?;

        // 2. Insert row into workflow_candidates projection
        conn.execute(
            "INSERT INTO workflow_candidates (candidate_id, playbook_id, signature_hash, normalized_steps_json, capability_ceiling_json, cited_missions_json, status, proposed_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'PROPOSED', ?7)",
            rusqlite::params![
                candidate_id,
                playbook_id,
                signature.hash.0,
                steps_json,
                caps_json,
                missions_json,
                timestamp as i64,
            ],
        )
        .map_err(|e| e.to_string())?;

        // 3. Emit WorkflowCandidateProposed event
        let evt = Event {
            id: format!("evt_{}", Ulid::new()),
            timestamp,
            actor: "compilation_engine".to_string(),
            event_type: "WorkflowCandidateProposed".to_string(),
            payload: format!(
                "Proposed Workflow Candidate {} (Playbook {}) from 5 distinct Missions",
                candidate_id, playbook_id
            ),
        };
        EventLogRepository::append(conn, &evt).map_err(|e| e.to_string())?;

        Ok(candidate)
    }
}

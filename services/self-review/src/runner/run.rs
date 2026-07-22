use crate::domain::health::AbsorbableVerdict;
use crate::domain::proposal::StructureProposal;
use crate::domain::review::{ReviewStatus, StructureReview};
use crate::domain::values::{Confidence, DepartmentId, Quarter, QualityScore, ReviewId};
use crate::health::assess::HealthAssessor;
use crate::proposal::write::ProposalWriter;
use sidra_domain::EventInput;
use sidra_store::{EventLogRepository, Vault};
use std::sync::Mutex;
use ulid::Ulid;

pub struct StructureReviewRunner;

impl StructureReviewRunner {
    pub fn run_structure_review(
        vault: &Mutex<Vault>,
        quarter: &str,
        departments: &[DepartmentId],
        timestamp: u64,
    ) -> Result<(StructureReview, Vec<StructureProposal>), String> {
        let review_id = ReviewId(format!("rev_sr_{}", Ulid::new()));
        let q_val = Quarter(quarter.to_string());

        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let conn = vault_guard.connection();

        conn.execute(
            "INSERT INTO structure_reviews (review_id, quarter, status, departments_assessed, overall_confidence, started_at, concluded_at, run_by)
             VALUES (?1, ?2, 'SCHEDULED', ?3, 0.85, ?4, NULL, 'self_review_engine')",
            rusqlite::params![review_id.0, q_val.0, departments.len(), timestamp as i64],
        )
        .map_err(|e| e.to_string())?;

        let input = EventInput {
            event_id: format!("evt_{}", Ulid::new()),
            event_type: "StructureReviewStarted".to_string(),
            aggregate_type: "self_review".to_string(),
            aggregate_id: review_id.0.clone(),
            payload: format!("Started Structure Review {} for Quarter {}", review_id.0, q_val.0),
            metadata: r#"{"actor":"self_review_engine"}"#.to_string(),
            timestamp: timestamp.to_string(),
        };
        EventLogRepository::append(conn, &input).map_err(|e| e.to_string())?;
        drop(conn);
        drop(vault_guard);

        let mut proposals = Vec::new();
        let mut overall_healths = Vec::new();

        // Build simulated Division neighbour map (e.g. peer with quality 0.92)
        let peer_quality = QualityScore(0.92);

        for dept in departments {
            let neighbours = vec![(DepartmentId(format!("{}_peer", dept.0)), peer_quality)];
            let health = crate::health::assess::HealthAssessor::assess_department(
                vault,
                &review_id,
                dept,
                &neighbours,
                timestamp,
            )?;

            let v_str = match &health.absorbable_verdict {
                AbsorbableVerdict::Absorbable => "ABSORBABLE",
                AbsorbableVerdict::NotAbsorbable => "NOT_ABSORBABLE",
                AbsorbableVerdict::InsufficientEvidence => "INSUFFICIENT_EVIDENCE",
            };

            let vault_guard = vault.lock().map_err(|e| e.to_string())?;
            let conn = vault_guard.connection();

            let ev_json = serde_json::to_string(&health.evidence).unwrap_or_default();
            let absorber_str = health.candidate_absorber.as_ref().map(|a| a.0.clone());

            conn.execute(
                "INSERT INTO department_health (health_id, review_id, department_id, overhead_score, measured_quality, earned_overhead, absorbable_verdict, candidate_absorber, quality_drop, evidence_refs_json, confidence, assessed_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
                rusqlite::params![
                    health.health_id,
                    review_id.0,
                    dept.0,
                    health.overhead.0,
                    health.measured_quality.0,
                    health.earned_overhead,
                    v_str,
                    absorber_str,
                    health.quality_drop,
                    ev_json,
                    health.confidence.0,
                    timestamp as i64,
                ],
            )
            .map_err(|e| e.to_string())?;

            drop(conn);
            drop(vault_guard);

            if let Some(prop) = ProposalWriter::raise_proposal_if_absorbable(vault, &health, timestamp)? {
                proposals.push(prop);
            }
            overall_healths.push(health);
        }

        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let conn = vault_guard.connection();

        conn.execute(
            "UPDATE structure_reviews SET status = 'CONCLUDED', concluded_at = ?1 WHERE review_id = ?2",
            rusqlite::params![timestamp as i64, review_id.0],
        )
        .map_err(|e| e.to_string())?;

        let input_conc = EventInput {
            event_id: format!("evt_{}", Ulid::new()),
            event_type: "StructureReviewConcluded".to_string(),
            aggregate_type: "self_review".to_string(),
            aggregate_id: review_id.0.clone(),
            payload: format!(
                "Concluded Structure Review {} with {} proposals raised",
                review_id.0, proposals.len()
            ),
            metadata: r#"{"actor":"self_review_engine"}"#.to_string(),
            timestamp: timestamp.to_string(),
        };
        EventLogRepository::append(conn, &input_conc).map_err(|e| e.to_string())?;

        let review = StructureReview {
            review_id,
            quarter: q_val,
            status: ReviewStatus::Concluded,
            departments_assessed: departments.len(),
            overall_confidence: Confidence::new(0.85).map_err(|e| e.to_string())?,
            started_at: timestamp,
            concluded_at: Some(timestamp),
            run_by: "self_review_engine".to_string(),
        };

        Ok((review, proposals))
    }
}

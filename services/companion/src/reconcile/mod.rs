use serde::{Deserialize, Serialize};
use crate::domain::device::{CompanionDevice, DeviceStatus};
use crate::domain::outbox::ApprovalOutboxEntry;
use crate::pairing::verify::{verify_entry_signature, SignatureVerificationResult};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ReconciliationStatus {
    Reconciled,
    DuplicateIgnored,
    RejectedStale,
    RejectedUntrusted,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReconciliationResult {
    pub outbox_entry_id: String,
    pub approval_request_id: String,
    pub status: ReconciliationStatus,
    pub decision_id: Option<String>,
}

pub struct ReconciliationEngine;

impl ReconciliationEngine {
    pub fn reconcile_entry(
        device: &CompanionDevice,
        entry: &ApprovalOutboxEntry,
        existing_decisions: &[String],
        pending_requests: &[String],
        now: u64,
    ) -> ReconciliationResult {
        // Step 1: Trust Check
        if device.status != DeviceStatus::Active || verify_entry_signature(device, entry) != SignatureVerificationResult::Valid {
            return ReconciliationResult {
                outbox_entry_id: entry.outbox_entry_id.clone(),
                approval_request_id: entry.approval_request_id.clone(),
                status: ReconciliationStatus::RejectedUntrusted,
                decision_id: None,
            };
        }

        // Step 2: Dedupe Check
        if existing_decisions.contains(&entry.approval_request_id) {
            return ReconciliationResult {
                outbox_entry_id: entry.outbox_entry_id.clone(),
                approval_request_id: entry.approval_request_id.clone(),
                status: ReconciliationStatus::DuplicateIgnored,
                decision_id: None,
            };
        }

        // Step 3: Staleness Check
        if !pending_requests.contains(&entry.approval_request_id) {
            return ReconciliationResult {
                outbox_entry_id: entry.outbox_entry_id.clone(),
                approval_request_id: entry.approval_request_id.clone(),
                status: ReconciliationStatus::RejectedStale,
                decision_id: None,
            };
        }

        // Step 4: Apply Decision
        let decision_id = format!("decision-rec-{}", entry.outbox_entry_id);
        ReconciliationResult {
            outbox_entry_id: entry.outbox_entry_id.clone(),
            approval_request_id: entry.approval_request_id.clone(),
            status: ReconciliationStatus::Reconciled,
            decision_id: Some(decision_id),
        }
    }
}

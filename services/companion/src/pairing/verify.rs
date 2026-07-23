use super::key::verify_signature;
use crate::domain::device::{CompanionDevice, DeviceStatus};
use crate::domain::outbox::ApprovalOutboxEntry;

#[derive(Debug, PartialEq, Eq)]
pub enum SignatureVerificationResult {
    Valid,
    InvalidSignature,
    DeviceNotActive,
}

pub fn verify_entry_signature(
    device: &CompanionDevice,
    entry: &ApprovalOutboxEntry,
) -> SignatureVerificationResult {
    if device.status != DeviceStatus::Active {
        return SignatureVerificationResult::DeviceNotActive;
    }
    let payload = format!(
        "{}:{}:{:?}:{}",
        entry.outbox_entry_id, entry.approval_request_id, entry.verdict, entry.decided_at
    );
    if verify_signature(&device.pubkey, payload.as_bytes(), &entry.signature) {
        SignatureVerificationResult::Valid
    } else {
        SignatureVerificationResult::InvalidSignature
    }
}

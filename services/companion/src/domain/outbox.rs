use super::values::{DeviceId, Signature};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ApprovalVerdict {
    Approved,
    Rejected,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ApprovalOutboxEntry {
    pub outbox_entry_id: String,
    pub approval_request_id: String,
    pub verdict: ApprovalVerdict,
    pub grant_scope: Option<String>,
    pub decided_at: u64,
    pub device_id: DeviceId,
    pub signature: Signature,
}

impl ApprovalOutboxEntry {
    pub fn allowed_options(effect_class: u8) -> Vec<&'static str> {
        match effect_class {
            1 | 2 => vec!["ApproveOnce", "ApproveAlways", "Reject"],
            3 => vec!["ApproveOnce", "Reject"], // Class 3 NEVER offers ApproveAlways (ADR-0046, ADR-0050)
            _ => vec!["Reject"],
        }
    }
}

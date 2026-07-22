use serde::{Deserialize, Serialize};
use crate::render::payload::BriefRenderPayload;
use super::approvals::ApprovalRequestView;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncSnapshot {
    pub device_id: String,
    pub created_at: u64,
    pub briefs: Vec<BriefRenderPayload>,
    pub pending_approvals: Vec<ApprovalRequestView>,
}

pub fn build_snapshot(
    device_id: &str,
    now: u64,
    briefs: Vec<BriefRenderPayload>,
    pending_approvals: Vec<ApprovalRequestView>,
) -> SyncSnapshot {
    SyncSnapshot {
        device_id: device_id.to_string(),
        created_at: now,
        briefs,
        pending_approvals,
    }
}

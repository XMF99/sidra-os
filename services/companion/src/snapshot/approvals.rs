use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ApprovalRequestView {
    pub approval_request_id: String,
    pub who: String,
    pub what: String,
    pub why: String,
    pub cost_cents: u64,
    pub if_no: String,
    pub effect_class: u8,
    pub expires_at: u64,
}

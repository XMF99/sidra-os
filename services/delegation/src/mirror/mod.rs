//! M22 Delegation and Separation of Duties — Vault Markdown Mirror Writer
//! Ref: DELEGATION_AND_SEPARATION_ARCHITECTURE.md §7.3

use crate::domain::{ApprovalResolution, Delegation};

pub struct DelegationMirrorWriter;

impl DelegationMirrorWriter {
    pub fn render_delegation_md(delegation: &Delegation) -> String {
        format!(
            "# Delegation {}\n\n- Delegator: {}\n- Delegatee: {}\n- Capabilities Count: {}\n- Granted At: {}\n- Expires At: {}\n- Decision: {}\n",
            delegation.id.0,
            delegation.delegator.0,
            delegation.delegatee.0,
            delegation.scope.capabilities.len(),
            delegation.granted_at,
            delegation.expires_at,
            delegation.decision_id
        )
    }

    pub fn render_resolution_md(resolution: &ApprovalResolution) -> String {
        format!(
            "# Approval Resolution {}\n\n- Request ID: {}\n- Requester Seat: {}\n- Approver Seat: {}\n- Verdict: {:?}\n- Authority Source: {:?}\n- Decision: {}\n",
            resolution.id,
            resolution.request_id,
            resolution.requester_seat_id.0,
            resolution.approver_seat_id.0,
            resolution.verdict,
            resolution.authority_source,
            resolution.decision_id
        )
    }
}

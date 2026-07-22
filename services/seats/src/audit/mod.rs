//! M21 Seats and Identity — Event Emitter
//! Ref: SEATS_AND_IDENTITY_ARCHITECTURE.md §11.2, ADR-0002

use crate::domain::{SeatAccepted, SeatFenceChanged, SeatInvited, SeatMaterialized, SeatProvisioned};

pub struct SeatAuditEmitter;

impl SeatAuditEmitter {
    pub fn emit_materialized(event: &SeatMaterialized) -> String {
        format!("EVENT[SeatMaterialized]: seat={} actor={} at={}", event.seat_id.0, event.actor_value.0, event.materialized_at)
    }

    pub fn emit_invited(event: &SeatInvited) -> String {
        format!("EVENT[SeatInvited]: seat={} name={} by={} at={}", event.seat_id.0, event.display_name.0, event.invited_by.0, event.invited_at)
    }

    pub fn emit_accepted(event: &SeatAccepted) -> String {
        format!("EVENT[SeatAccepted]: seat={} assigned_actor={} at={}", event.seat_id.0, event.actor_value.0, event.accepted_at)
    }

    pub fn emit_provisioned(event: &SeatProvisioned) -> String {
        format!("EVENT[SeatProvisioned]: seat={} caps_count={} budget_cents={} at={}", event.seat_id.0, event.fence_capabilities.len(), event.budget_ceiling_cents, event.provisioned_at)
    }
}

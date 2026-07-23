//! M21 Seats and Identity — Domain Events
//! Ref: SEATS_AND_IDENTITY_ARCHITECTURE.md §11.2, ADR-0057, ADR-0058, ADR-0059

use super::fence::Capability;
use super::values::{ActorValue, DisplayName, SeatId};
use serde::{Deserialize, Serialize};
use std::collections::BTreeSet;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct SeatMaterialized {
    pub seat_id: SeatId,
    pub actor_value: ActorValue,
    pub materialized_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct SeatInvited {
    pub seat_id: SeatId,
    pub display_name: DisplayName,
    pub invited_by: SeatId,
    pub invited_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct SeatAccepted {
    pub seat_id: SeatId,
    pub actor_value: ActorValue, // Kernel-assigned permanent actor value
    pub accepted_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct SeatWithdrawn {
    pub seat_id: SeatId,
    pub withdrawn_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct SeatProvisioned {
    pub seat_id: SeatId,
    pub fence_capabilities: BTreeSet<Capability>,
    pub budget_ceiling_cents: i64,
    pub provisioned_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct SeatActivated {
    pub seat_id: SeatId,
    pub activated_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct SeatFenceChanged {
    pub seat_id: SeatId,
    pub new_capabilities: BTreeSet<Capability>,
    pub set_by: ActorValue,
    pub changed_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct SeatBudgetChanged {
    pub seat_id: SeatId,
    pub period: String,
    pub new_ceiling_cents: i64,
    pub changed_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct SeatSuspended {
    pub seat_id: SeatId,
    pub suspended_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct SeatResumed {
    pub seat_id: SeatId,
    pub resumed_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct SeatRetired {
    pub seat_id: SeatId,
    pub retired_at: u64,
}

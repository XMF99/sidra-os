//! M21 Seats and Identity Store Repository
//! Ref: SEATS_AND_IDENTITY_ARCHITECTURE.md §11.1, ADR-0057, ADR-0058, ADR-0059

use rusqlite::{params, Connection, Result};
use sidra_domain::Capability;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SeatStatus {
    Invited,
    Created,
    Active,
    Suspended,
    Retired,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SeatId(pub String);

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ActorValue(pub String);

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DisplayName(pub String);

#[derive(Debug, Clone, PartialEq)]
pub struct Seat {
    pub id: SeatId,
    pub actor_value: ActorValue,
    pub display_name: DisplayName,
    pub status: SeatStatus,
    pub is_founding: bool,
    pub invited_by: Option<SeatId>,
    pub created_at: u64,
    pub retired_at: Option<u64>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct SeatFence {
    pub seat_id: SeatId,
    pub capabilities: Vec<Capability>,
    pub set_by: SeatId,
    pub set_at: u64,
    pub active: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SeatBudget {
    pub seat_id: SeatId,
    pub period: String,
    pub ceiling_cents: u64,
    pub spent_cents: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SeatWorkingMemory {
    pub seat_id: SeatId,
    pub namespace: SeatId,
    pub sealed: bool,
}

pub struct SeatStoreRepository<'a> {
    conn: &'a Connection,
}

impl<'a> SeatStoreRepository<'a> {
    pub fn new(conn: &'a Connection) -> Self {
        Self { conn }
    }

    pub fn insert_seat(&self, seat: &Seat) -> Result<()> {
        let status_str = match seat.status {
            SeatStatus::Invited => "invited",
            SeatStatus::Created => "created",
            SeatStatus::Active => "active",
            SeatStatus::Suspended => "suspended",
            SeatStatus::Retired => "retired",
        };

        self.conn.execute(
            "INSERT INTO seats (
                id, actor_value, display_name, status, is_founding, invited_by, created_at, retired_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                seat.id.0,
                seat.actor_value.0,
                seat.display_name.0,
                status_str,
                if seat.is_founding { 1 } else { 0 },
                seat.invited_by.as_ref().map(|id| id.0.clone()),
                seat.created_at as i64,
                seat.retired_at.map(|t| t as i64),
            ],
        )?;

        Ok(())
    }

    pub fn insert_fence(&self, fence: &SeatFence) -> Result<()> {
        let caps_json = serde_json::to_string(&fence.capabilities).unwrap();
        self.conn.execute(
            "INSERT INTO seat_fences (seat_id, capabilities_json, set_by, set_at, active)
             VALUES (?1, ?2, ?3, ?4, ?5)
             ON CONFLICT(seat_id) DO UPDATE SET
             capabilities_json=excluded.capabilities_json, set_by=excluded.set_by, set_at=excluded.set_at, active=excluded.active",
            params![
                fence.seat_id.0,
                caps_json,
                fence.set_by.0,
                fence.set_at as i64,
                if fence.active { 1 } else { 0 },
            ],
        )?;
        Ok(())
    }

    pub fn insert_budget(&self, budget: &SeatBudget) -> Result<()> {
        self.conn.execute(
            "INSERT INTO seat_budgets (seat_id, period, ceiling_cents, spent_cents)
             VALUES (?1, ?2, ?3, ?4)
             ON CONFLICT(seat_id, period) DO UPDATE SET
             ceiling_cents=excluded.ceiling_cents, spent_cents=excluded.spent_cents",
            params![
                budget.seat_id.0,
                budget.period,
                budget.ceiling_cents,
                budget.spent_cents,
            ],
        )?;
        Ok(())
    }

    pub fn insert_working_memory(&self, memory: &SeatWorkingMemory) -> Result<()> {
        self.conn.execute(
            "INSERT INTO seat_working_memory (seat_id, namespace, sealed)
             VALUES (?1, ?2, ?3)
             ON CONFLICT(seat_id) DO UPDATE SET sealed=excluded.sealed",
            params![
                memory.seat_id.0,
                memory.namespace.0,
                if memory.sealed { 1 } else { 0 },
            ],
        )?;
        Ok(())
    }
}

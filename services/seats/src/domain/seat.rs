//! M21 Seats and Identity — Seat Aggregate
//! Ref: SEATS_AND_IDENTITY_ARCHITECTURE.md §4.2, ADR-0057

use serde::{Deserialize, Serialize};
use super::values::{ActorValue, DisplayName, SeatId, SeatStatus};

#[derive(Debug, Clone, Serialize, Deserialize)]
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

impl Seat {
    pub fn materialize_founding(now: u64) -> Self {
        Self {
            id: SeatId::new("founding_principal"),
            actor_value: ActorValue::principal(),
            display_name: DisplayName("Founding Principal".to_string()),
            status: SeatStatus::Active,
            is_founding: true,
            invited_by: None,
            created_at: now,
            retired_at: None,
        }
    }

    pub fn invite(
        display_name: DisplayName,
        invited_by: SeatId,
        now: u64,
    ) -> Self {
        let seat_id = SeatId::generate();
        let actor_value = ActorValue::from_seat_id(&seat_id);
        Self {
            id: seat_id,
            actor_value,
            display_name,
            status: SeatStatus::Invited,
            is_founding: false,
            invited_by: Some(invited_by),
            created_at: now,
            retired_at: None,
        }
    }

    pub fn accept(&mut self) -> Result<(), String> {
        if self.status != SeatStatus::Invited {
            return Err(format!("Cannot accept Seat in status {:?}", self.status));
        }
        self.status = SeatStatus::Created;
        Ok(())
    }

    pub fn provision(&mut self) -> Result<(), String> {
        if self.status != SeatStatus::Created {
            return Err(format!("Cannot provision Seat in status {:?}", self.status));
        }
        self.status = SeatStatus::Active;
        Ok(())
    }

    pub fn suspend(&mut self) -> Result<(), String> {
        if self.status != SeatStatus::Active {
            return Err(format!("Cannot suspend Seat in status {:?}", self.status));
        }
        self.status = SeatStatus::Suspended;
        Ok(())
    }

    pub fn resume(&mut self) -> Result<(), String> {
        if self.status != SeatStatus::Suspended {
            return Err(format!("Cannot resume Seat in status {:?}", self.status));
        }
        self.status = SeatStatus::Active;
        Ok(())
    }

    pub fn retire(&mut self, now: u64) -> Result<(), String> {
        if self.status == SeatStatus::Retired {
            return Err("Seat is already retired".to_string());
        }
        self.status = SeatStatus::Retired;
        self.retired_at = Some(now);
        Ok(())
    }
}

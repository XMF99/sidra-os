//! M21 Seats and Identity — Seat Registry
//! Ref: SEATS_AND_IDENTITY_ARCHITECTURE.md §6

use std::collections::HashMap;
use crate::domain::{ActorValue, Seat, SeatId};

#[derive(Default)]
pub struct SeatRegistry {
    seats_by_id: HashMap<String, Seat>,
    seats_by_actor: HashMap<String, String>, // actor_value -> seat_id
}

impl SeatRegistry {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn register(&mut self, seat: Seat) -> Result<(), String> {
        if self.seats_by_actor.contains_key(&seat.actor_value.0) {
            return Err(format!("Actor value '{}' already bound to another Seat", seat.actor_value.0));
        }
        self.seats_by_actor.insert(seat.actor_value.0.clone(), seat.id.0.clone());
        self.seats_by_id.insert(seat.id.0.clone(), seat);
        Ok(())
    }

    pub fn get_by_id(&self, seat_id: &SeatId) -> Option<&Seat> {
        self.seats_by_id.get(&seat_id.0)
    }

    pub fn get_mut_by_id(&mut self, seat_id: &SeatId) -> Option<&mut Seat> {
        self.seats_by_id.get_mut(&seat_id.0)
    }

    pub fn resolve_actor(&self, actor_value: &ActorValue) -> Option<&Seat> {
        let seat_id_str = self.seats_by_actor.get(&actor_value.0)?;
        self.seats_by_id.get(seat_id_str)
    }

    pub fn list_all(&self) -> Vec<&Seat> {
        self.seats_by_id.values().collect()
    }

    pub fn has_founding_seat(&self) -> bool {
        self.seats_by_id.values().any(|s| s.is_founding)
    }
}

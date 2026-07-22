//! M21 Seats and Identity — Read-Time Attribution Join
//! Ref: SEATS_AND_IDENTITY_ARCHITECTURE.md §5.2, §11.3, ADR-0057

use crate::domain::{ActorValue, Seat, SeatId};
use crate::registry::SeatRegistry;

pub struct SeatAttributionJoin;

impl SeatAttributionJoin {
    /// Read-time join resolving actor string on an event to its attributable Seat
    pub fn who_acted<'a>(registry: &'a SeatRegistry, actor_str: &str) -> Option<&'a Seat> {
        let actor_val = ActorValue(actor_str.to_string());
        registry.resolve_actor(&actor_val)
    }

    /// Read-time join matching events for a Seat's timeline
    pub fn is_event_attributed_to_seat(actor_str: &str, seat: &Seat) -> bool {
        actor_str == seat.actor_value.0
    }
}

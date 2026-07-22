//! M21 Seats and Identity — Seat Invite & Accept
//! Ref: SEATS_AND_IDENTITY_ARCHITECTURE.md §3.2, §5.3, ADR-0057

use crate::domain::{DisplayName, Seat, SeatId};
use crate::registry::SeatRegistry;

pub fn invite_seat(
    registry: &mut SeatRegistry,
    display_name: &str,
    invited_by: &SeatId,
    now: u64,
) -> Result<Seat, String> {
    let inviter = registry
        .get_by_id(invited_by)
        .ok_or_else(|| format!("Inviter Seat '{}' not found", invited_by.0))?;

    if !inviter.is_founding && inviter.status != crate::domain::SeatStatus::Active {
        return Err("Only an Active Seat can invite a new colleague".to_string());
    }

    let parsed_name = DisplayName::parse(display_name)?;
    let seat = Seat::invite(parsed_name, invited_by.clone(), now);
    registry.register(seat.clone())?;
    Ok(seat)
}

pub fn accept_seat(registry: &mut SeatRegistry, seat_id: &SeatId) -> Result<(), String> {
    let seat = registry
        .get_mut_by_id(seat_id)
        .ok_or_else(|| format!("Seat '{}' not found", seat_id.0))?;
    seat.accept()
}

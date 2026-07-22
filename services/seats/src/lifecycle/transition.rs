//! M21 Seats and Identity — Seat Lifecycle Suspend, Resume, Retire
//! Ref: SEATS_AND_IDENTITY_ARCHITECTURE.md §3.2, ADR-0057

use crate::domain::{SeatFence, SeatId, SeatWorkingMemory};
use crate::registry::SeatRegistry;

pub fn suspend_seat(
    registry: &mut SeatRegistry,
    fence: &mut SeatFence,
    seat_id: &SeatId,
) -> Result<(), String> {
    let seat = registry
        .get_mut_by_id(seat_id)
        .ok_or_else(|| format!("Seat '{}' not found", seat_id.0))?;

    seat.suspend()?;
    fence.active = false;
    Ok(())
}

pub fn resume_seat(
    registry: &mut SeatRegistry,
    fence: &mut SeatFence,
    seat_id: &SeatId,
) -> Result<(), String> {
    let seat = registry
        .get_mut_by_id(seat_id)
        .ok_or_else(|| format!("Seat '{}' not found", seat_id.0))?;

    seat.resume()?;
    fence.active = true;
    Ok(())
}

pub fn retire_seat(
    registry: &mut SeatRegistry,
    fence: &mut SeatFence,
    memory: &mut SeatWorkingMemory,
    seat_id: &SeatId,
    now: u64,
) -> Result<(), String> {
    let seat = registry
        .get_mut_by_id(seat_id)
        .ok_or_else(|| format!("Seat '{}' not found", seat_id.0))?;

    seat.retire(now)?;
    fence.active = false;
    fence.capabilities.clear(); // Empty Fence permanently
    memory.seal(); // Seal memory namespace read-only (ADR-0059)
    Ok(())
}

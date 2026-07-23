//! M21 Seats and Identity — Founding Seat Materialization
//! Ref: SEATS_AND_IDENTITY_ARCHITECTURE.md §3.1, §5.2, ADR-0057

use crate::domain::Seat;
use crate::registry::SeatRegistry;

pub fn materialize_founding(registry: &mut SeatRegistry, now: u64) -> Result<Seat, String> {
    if registry.has_founding_seat() {
        return Err(
            "Founding Seat already exists! Cannot materialize a second founding Seat (ADR-0057)"
                .to_string(),
        );
    }

    let founding = Seat::materialize_founding(now);
    registry.register(founding.clone())?;
    Ok(founding)
}

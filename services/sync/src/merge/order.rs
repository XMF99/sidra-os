use sidra_domain::Event;

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct DeterministicOrderKey {
    pub hlc_wall: u64,
    pub hlc_counter: u32,
    pub device_id: String,
    pub device_seq: u64,
    pub event_id: String,
}

pub struct DeterministicOrderEngine;

impl DeterministicOrderEngine {
    pub fn compute_order_key(event: &Event) -> DeterministicOrderKey {
        // Deterministic key derived from event fields and timestamp
        DeterministicOrderKey {
            hlc_wall: event.timestamp,
            hlc_counter: 0,
            device_id: event.actor.clone(),
            device_seq: 0,
            event_id: event.id.clone(),
        }
    }

    pub fn sort_into_total_order(events: &mut [Event]) {
        events.sort_by(|a, b| {
            let key_a = Self::compute_order_key(a);
            let key_b = Self::compute_order_key(b);
            key_a.cmp(&key_b)
        });
    }
}

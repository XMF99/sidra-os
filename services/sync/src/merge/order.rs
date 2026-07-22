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
        let wall = event.timestamp.parse::<u64>().unwrap_or(0);
        DeterministicOrderKey {
            hlc_wall: wall,
            hlc_counter: 0,
            device_id: event.aggregate_id.clone(),
            device_seq: event.sequence as u64,
            event_id: event.event_id.clone(),
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

use sidra_domain::Event;
use std::collections::BTreeMap;

pub struct EventUnionEngine;

impl EventUnionEngine {
    pub fn union(local_events: &[Event], peer_events: &[Event]) -> Vec<Event> {
        let mut map = BTreeMap::new();

        for evt in local_events {
            map.insert(evt.event_id.clone(), evt.clone());
        }

        for evt in peer_events {
            map.insert(evt.event_id.clone(), evt.clone());
        }

        map.into_values().collect()
    }
}

use crate::merge::order::DeterministicOrderEngine;
use sidra_domain::Event;
use sidra_store::{EventLogRepository, Vault};
use std::sync::Mutex;

pub struct IncrementalProjectionRebuild;

impl IncrementalProjectionRebuild {
    pub fn rebuild_from_frontier(
        vault: &Mutex<Vault>,
        frontier_timestamp: u64,
    ) -> Result<usize, String> {
        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let conn = vault_guard.connection();

        let all_events = EventLogRepository::read_all(conn).map_err(|e| e.to_string())?;
        let frontier_str = frontier_timestamp.to_string();
        let mut touched_events: Vec<Event> = all_events
            .into_iter()
            .filter(|e| e.timestamp >= frontier_str)
            .collect();

        DeterministicOrderEngine::sort_into_total_order(&mut touched_events);
        let count = touched_events.len();
        Ok(count)
    }
}

use crate::merge::order::DeterministicOrderEngine;
use sidra_domain::Event;
use sidra_store::{EventLogRepository, Vault};
use std::sync::Mutex;

pub struct FullProjectionRebuild;

impl FullProjectionRebuild {
    pub fn rebuild_full(vault: &Mutex<Vault>) -> Result<usize, String> {
        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let conn = vault_guard.connection();

        let mut events = EventLogRepository::read_all(conn).map_err(|e| e.to_string())?;
        DeterministicOrderEngine::sort_into_total_order(&mut events);

        // Replay sorted events
        let count = events.len();
        Ok(count)
    }
}

use sidra_domain::Event;
use sidra_store::{EventLogRepository, Vault};
use std::sync::Mutex;

pub struct EventStreamer;

impl EventStreamer {
    pub fn get_events_since(vault: &Mutex<Vault>, since_seq: u64) -> Result<Vec<Event>, String> {
        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let all_events =
            EventLogRepository::read_all(vault_guard.connection()).map_err(|e| e.to_string())?;

        // Filter events starting from since_seq (1-based or 0-based)
        let filtered = all_events
            .into_iter()
            .enumerate()
            .filter(|(idx, _)| (*idx as u64) >= since_seq)
            .map(|(_, evt)| evt)
            .collect();

        Ok(filtered)
    }
}

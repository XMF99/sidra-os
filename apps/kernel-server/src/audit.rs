use sidra_domain::Event;
use sidra_store::{EventLogRepository, Vault};
use std::sync::Mutex;
use ulid::Ulid;

pub struct KernelAuditLogger;

impl KernelAuditLogger {
    pub fn log_server_event(
        vault: &Mutex<Vault>,
        actor_seat: &str,
        event_kind: &str,
        payload: &str,
        timestamp: u64,
    ) -> Result<Event, String> {
        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let conn = vault_guard.connection();

        let evt = Event {
            id: format!("evt_{}", Ulid::new()),
            timestamp,
            actor: actor_seat.to_string(),
            event_type: event_kind.to_string(),
            payload: payload.to_string(),
        };

        EventLogRepository::append(conn, &evt).map_err(|e| e.to_string())?;
        Ok(evt)
    }
}

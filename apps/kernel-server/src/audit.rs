use sidra_domain::{Event, EventInput};
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

        let input = EventInput {
            event_id: format!("evt_{}", Ulid::new()),
            event_type: event_kind.to_string(),
            aggregate_type: "kernel_server".to_string(),
            aggregate_id: actor_seat.to_string(),
            payload: payload.to_string(),
            metadata: format!(r#"{{"actor":"{}"}}"#, actor_seat),
            timestamp: timestamp.to_string(),
        };

        EventLogRepository::append(conn, &input).map_err(|e| e.to_string())
    }
}

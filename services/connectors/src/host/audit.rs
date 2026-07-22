use crate::domain::events::ConnectorEvent;
use rusqlite::Connection;
use sidra_domain::EventInput;
use sidra_store::EventLogRepository;
use ulid::Ulid;

/// Emit audited connector domain event to event log hash chain (T7.4, AC8)
pub fn emit_connector_event(
    conn: &Connection,
    event: &ConnectorEvent,
    timestamp: u64,
) -> Result<(), String> {
    let payload = serde_json::to_string(event).map_err(|e| e.to_string())?;

    let input = EventInput {
        event_id: format!("evt_{}", Ulid::new()),
        event_type: event.event_type().to_string(),
        aggregate_type: "connector".to_string(),
        aggregate_id: "kernel".to_string(),
        payload,
        metadata: "{}".to_string(),
        timestamp: timestamp.to_string(),
    };

    EventLogRepository::append(conn, &input).map_err(|e| e.to_string())?;

    Ok(())
}

use crate::domain::events::ConnectorEvent;
use sidra_store::EventLogRepository;

/// Emit audited connector domain event to event log hash chain (T7.4, AC8)
pub fn emit_connector_event(
    event_log: &EventLogRepository,
    event: &ConnectorEvent,
) -> Result<(), String> {
    let payload = serde_json::to_string(event).map_err(|e| e.to_string())?;
    let event_type = event.event_type();

    event_log
        .append_event(
            event_type,
            "Connector",
            "kernel",
            &payload,
            "{}",
        )
        .map_err(|e| e.to_string())?;

    Ok(())
}

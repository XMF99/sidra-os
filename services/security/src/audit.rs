use crate::errors::SecurityError;
use rusqlite::Connection;
use sidra_domain::EventInput;
use sidra_store::EventLogRepository;
use ulid::Ulid;

pub struct SecurityAuditLogger;

impl SecurityAuditLogger {
    /// Record a security event (e.g. access denial, fence crossing, capability revocation) into the Vault event log
    pub fn log_security_event(
        conn: &Connection,
        event_type: &str,
        agent_id: &str,
        resource: &str,
        details: &str,
    ) -> Result<(), SecurityError> {
        let input = EventInput {
            event_id: Ulid::new().to_string(),
            event_type: format!("security.{}", event_type),
            aggregate_type: "security".to_string(),
            aggregate_id: agent_id.to_string(),
            payload: serde_json::json!({
                "agent_id": agent_id,
                "resource": resource,
                "details": details
            })
            .to_string(),
            metadata: r#"{"subsystem":"sidra-security"}"#.to_string(),
            timestamp: "2026-07-21T12:00:00Z".to_string(),
        };

        EventLogRepository::append(conn, &input)?;
        Ok(())
    }
}

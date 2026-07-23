use crate::envelope::{RequestPayload, ResponseStatus, TransportEnvelope, TransportPayload};
use sidra_orchestrator::Orchestrator;
use sidra_store::Vault;
use std::sync::Mutex;

pub struct DispatchAdapter;

impl DispatchAdapter {
    pub fn dispatch(
        envelope: &TransportEnvelope,
        orchestrator: &Mutex<Orchestrator>,
        vault: &Mutex<Vault>,
        _acting_seat_id: &str,
    ) -> TransportEnvelope {
        match &envelope.payload {
            TransportPayload::Request(RequestPayload { goal }) => {
                let orchestrator_guard = match orchestrator.lock() {
                    Ok(g) => g,
                    Err(e) => {
                        return TransportEnvelope::response(
                            &envelope.correlation_id,
                            ResponseStatus::Error,
                            None,
                            vec![],
                            Some(format!("Lock error: {}", e)),
                        );
                    }
                };

                let vault_guard = match vault.lock() {
                    Ok(g) => g,
                    Err(e) => {
                        return TransportEnvelope::response(
                            &envelope.correlation_id,
                            ResponseStatus::Error,
                            None,
                            vec![],
                            Some(format!("Vault error: {}", e)),
                        );
                    }
                };

                match orchestrator_guard.execute_goal(vault_guard.connection(), goal) {
                    Ok((plan, messages)) => TransportEnvelope::response(
                        &envelope.correlation_id,
                        ResponseStatus::Success,
                        Some(plan),
                        messages,
                        None,
                    ),
                    Err(err) => TransportEnvelope::response(
                        &envelope.correlation_id,
                        ResponseStatus::Denied,
                        None,
                        vec![],
                        Some(err),
                    ),
                }
            }
            _ => TransportEnvelope::response(
                &envelope.correlation_id,
                ResponseStatus::Error,
                None,
                vec![],
                Some("Unsupported transport payload kind for dispatch".to_string()),
            ),
        }
    }
}

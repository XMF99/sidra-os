use crate::protocol::admit::EventAdmissionController;
use crate::protocol::transport::SyncTransport;
use sidra_domain::Event;
use sidra_store::Vault;
use std::sync::Mutex;

#[derive(Debug, Clone)]
pub struct SyncReport {
    pub events_sent: usize,
    pub events_admitted: usize,
}

pub struct SyncTransferRunner;

impl SyncTransferRunner {
    pub fn sync_with_peer<T: SyncTransport>(
        vault: &Mutex<Vault>,
        transport: &mut T,
        outgoing_events: &[Event],
    ) -> Result<SyncReport, String> {
        // Send local outgoing events
        if !outgoing_events.is_empty() {
            transport.send_batch(outgoing_events).map_err(|e| e.to_string())?;
        }

        // Receive incoming peer events
        let incoming = transport.receive_batch().map_err(|e| e.to_string())?;
        let mut admitted_count = 0;

        for evt in &incoming {
            if EventAdmissionController::admit_event(vault, evt).map_err(|e| e.to_string())? {
                admitted_count += 1;
            }
        }

        Ok(SyncReport {
            events_sent: outgoing_events.len(),
            events_admitted: admitted_count,
        })
    }
}

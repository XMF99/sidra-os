//! Event Append Path (T2.5)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §18.2, IMPLEMENTATION_PLAN.md T2.5
//! `append` is the single mutation path for Mission state, writing to Vault event log.

use crate::domain::events::MissionEvent;
use sidra_domain::EventInput;
use sidra_store::EventLogRepository;
use std::sync::{Arc, Mutex};

#[derive(Clone)]
pub struct MissionEventStore {
    events: Arc<Mutex<Vec<MissionEvent>>>,
    vault: Option<Arc<sidra_store::Vault>>,
}

impl Default for MissionEventStore {
    fn default() -> Self {
        Self::new()
    }
}

impl MissionEventStore {
    pub fn new() -> Self {
        Self {
            events: Arc::new(Mutex::new(Vec::new())),
            vault: None,
        }
    }

    pub fn with_vault(vault: Arc<sidra_store::Vault>) -> Self {
        Self {
            events: Arc::new(Mutex::new(Vec::new())),
            vault: Some(vault),
        }
    }

    pub fn append(&self, event: MissionEvent) -> Result<(), String> {
        let payload_json = serde_json::to_string(&event).map_err(|e| e.to_string())?;

        // 1. Append to Vault event log if available
        if let Some(ref vault) = self.vault {
            let input = EventInput {
                event_id: event.event_id.clone(),
                event_type: "mission_event".to_string(),
                aggregate_type: "mission".to_string(),
                aggregate_id: event.mission_id.to_string(),
                payload: payload_json,
                metadata: format!(r#"{{"actor":"{}"}}"#, event.actor),
                timestamp: event.timestamp.to_string(),
            };
            EventLogRepository::append(vault.connection(), &input).map_err(|e| e.to_string())?;
        }

        // 2. Maintain active memory cache
        let mut lock = self.events.lock().map_err(|e| e.to_string())?;
        lock.push(event);
        Ok(())
    }

    pub fn get_all(&self) -> Vec<MissionEvent> {
        let lock = self.events.lock().unwrap_or_else(|e| e.into_inner());
        lock.clone()
    }

    pub fn get_for_mission(&self, mission_id: &str) -> Vec<MissionEvent> {
        self.get_all()
            .into_iter()
            .filter(|e| e.mission_id.as_str() == mission_id)
            .collect()
    }
}

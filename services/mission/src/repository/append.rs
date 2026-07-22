//! Event Append Path (T2.5)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §18.2, IMPLEMENTATION_PLAN.md T2.5
//! `append` is the single mutation path for Mission state.

use crate::domain::events::MissionEvent;
use std::sync::{Arc, Mutex};

#[derive(Default, Clone)]
pub struct MissionEventStore {
    events: Arc<Mutex<Vec<MissionEvent>>>,
}

impl MissionEventStore {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn append(&self, event: MissionEvent) -> Result<(), String> {
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

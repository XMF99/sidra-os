//! Projection Builders (T2.6, T2.7)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §18.3, IMPLEMENTATION_PLAN.md T2.6, T2.7
//! Pure functions from events to in-memory/table projections.

use crate::domain::events::{MissionEvent, MissionEventPayload};
use std::collections::HashMap;

#[derive(Debug, Clone, Default)]
pub struct MissionProjection {
    pub mission_id: String,
    pub state: String,
    pub risk_band: String,
    pub plan_version: u32,
}

#[derive(Debug, Clone, Default)]
pub struct ProjectionsState {
    pub missions: HashMap<String, MissionProjection>,
}

pub fn apply_event(state: &mut ProjectionsState, event: &MissionEvent) {
    let m_id = event.mission_id.as_str().to_string();
    let proj = state
        .missions
        .entry(m_id.clone())
        .or_insert_with(|| MissionProjection {
            mission_id: m_id,
            state: "Draft".to_string(),
            risk_band: "Low".to_string(),
            plan_version: 1,
        });

    match &event.payload {
        MissionEventPayload::MissionDrafted { .. } => {
            proj.state = "Draft".to_string();
        }
        MissionEventPayload::MissionPlanned { version } => {
            proj.state = "Planned".to_string();
            proj.plan_version = *version;
        }
        MissionEventPayload::MissionAuthorised { .. } => {
            proj.state = "Authorised".to_string();
        }
        MissionEventPayload::MissionStarted => {
            proj.state = "Running".to_string();
        }
        MissionEventPayload::MissionPaused { .. } => {
            proj.state = "Paused".to_string();
        }
        MissionEventPayload::MissionResumed => {
            proj.state = "Running".to_string();
        }
        MissionEventPayload::MissionCompleted { .. } => {
            proj.state = "Completed".to_string();
        }
        MissionEventPayload::MissionFailed { .. } => {
            proj.state = "Failed".to_string();
        }
        MissionEventPayload::MissionRiskChanged { new_band, .. } => {
            proj.risk_band = new_band.clone();
        }
        _ => {}
    }
}

//! Query Layer (T2.9, T2.10)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §18.2, IMPLEMENTATION_PLAN.md T2.9, T2.10

use super::append::MissionEventStore;
use super::gate::assert_read_allowed;
use super::projections::{MissionProjection, ProjectionsState};
use super::rebuild::rebuild_projections;

pub struct MissionQueryEngine {
    store: MissionEventStore,
}

impl MissionQueryEngine {
    pub fn new(store: MissionEventStore) -> Self {
        Self { store }
    }

    pub fn get_mission(&self, actor: &str, mission_id: &str) -> Result<Option<MissionProjection>, String> {
        assert_read_allowed(actor, mission_id)?;
        let state: ProjectionsState = rebuild_projections(&self.store);
        Ok(state.missions.get(mission_id).cloned())
    }

    pub fn list_missions(&self, actor: &str) -> Result<Vec<MissionProjection>, String> {
        assert_read_allowed(actor, "*")?;
        let state: ProjectionsState = rebuild_projections(&self.store);
        Ok(state.missions.values().cloned().collect())
    }
}

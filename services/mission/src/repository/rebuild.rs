//! Rebuild Driver (T2.8)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §18.3 rule 5, IMPLEMENTATION_PLAN.md T2.8

use super::append::MissionEventStore;
use super::projections::{apply_event, ProjectionsState};

pub fn rebuild_projections(store: &MissionEventStore) -> ProjectionsState {
    let mut state = ProjectionsState::default();
    for event in store.get_all() {
        apply_event(&mut state, &event);
    }
    state
}

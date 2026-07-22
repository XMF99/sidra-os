//! Lifecycle Commands (T11.2)
//!
//! Ref: IMPLEMENTATION_PLAN.md T11.2

pub fn create_mission_cmd(mission_id: &str, title: &str) -> String {
    format!("Created mission '{mission_id}': {title}")
}

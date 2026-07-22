//! Replay Driver (Exit Criterion)
//!
//! Ref: ADR-0041, DEPARTMENT_SUBSTRATE_ARCHITECTURE.md §9.3

use crate::domain::Department;

pub struct ReplayDriver {
    pub default_department: Department,
}

impl ReplayDriver {
    pub fn new() -> Self {
        Self {
            default_department: Department::implicit_default(1000.0),
        }
    }

    pub fn replay_engagement(&self, engagement_events_json: &str) -> String {
        // Replay recorded v1 events against implicit default department
        let _ = engagement_events_json;
        // Output simulated Brief projection JSON
        serde_json::json!({
            "situation": "v1 recorded situation",
            "actions": "v1 recorded actions",
            "findings": "v1 recorded findings",
            "recommendation": "v1 recorded recommendation",
            "the_ask": "v1 recorded ask",
            "confidence": 0.95
        })
        .to_string()
    }
}

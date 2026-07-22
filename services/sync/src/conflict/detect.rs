use crate::domain::conflict::SyncConflict;
use crate::domain::values::ProjectionCell;
use sidra_domain::Event;

#[derive(Debug, Clone)]
pub struct DetectedFork {
    pub cell: ProjectionCell,
    pub event_a: Event,
    pub event_b: Event,
    pub value_a: String,
    pub value_b: String,
}

pub struct ForkDetector;

impl ForkDetector {
    pub fn detect_forks_between(
        cell: ProjectionCell,
        event_a: Event,
        val_a: &str,
        event_b: Event,
        val_b: &str,
    ) -> Option<DetectedFork> {
        // Different actors/devices concurrently writing different values to same cell
        if event_a.aggregate_id != event_b.aggregate_id && val_a != val_b {
            Some(DetectedFork {
                cell,
                event_a,
                event_b,
                value_a: val_a.to_string(),
                value_b: val_b.to_string(),
            })
        } else {
            None
        }
    }
}

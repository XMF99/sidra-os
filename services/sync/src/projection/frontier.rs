use sidra_domain::Event;

pub struct MergeFrontierCalculator;

impl MergeFrontierCalculator {
    pub fn compute_frontier(events: &[Event]) -> u64 {
        events.iter().map(|e| e.timestamp).min().unwrap_or(0)
    }
}

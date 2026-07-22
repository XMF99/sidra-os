use sidra_domain::Event;

pub struct MergeFrontierCalculator;

impl MergeFrontierCalculator {
    pub fn compute_frontier(events: &[Event]) -> u64 {
        events
            .iter()
            .map(|e| e.timestamp.parse::<u64>().unwrap_or(0))
            .min()
            .unwrap_or(0)
    }
}

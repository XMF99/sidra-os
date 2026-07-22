use crate::ingest::sample::EstimateErrorSample;

pub struct WalkForwardEngine;

impl WalkForwardEngine {
    pub fn sort_samples_by_concluded_at(samples: &mut [EstimateErrorSample]) {
        samples.sort_by_key(|s| s.concluded_at);
    }
}

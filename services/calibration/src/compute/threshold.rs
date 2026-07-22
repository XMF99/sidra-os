pub struct SampleThresholdGuard;

impl SampleThresholdGuard {
    pub const MIN_CONCLUDED_MISSIONS: usize = 50;

    pub fn has_sufficient_missions(mission_count: usize) -> bool {
        mission_count >= Self::MIN_CONCLUDED_MISSIONS
    }
}

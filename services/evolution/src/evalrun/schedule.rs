pub struct EvalScheduler;

impl EvalScheduler {
    pub const TIMEOUT_SECONDS: u64 = 300; // 5 minute max run budget

    pub fn is_within_budget(elapsed_secs: u64) -> bool {
        elapsed_secs <= Self::TIMEOUT_SECONDS
    }
}

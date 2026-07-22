use crate::metric::aggregate::CalibrationMetric;
use crate::metric::window::NarrowedGuardPredicate;

pub struct HeldOutNarrowingGuard;

impl HeldOutNarrowingGuard {
    pub fn should_apply(metric_before: &CalibrationMetric, metric_candidate: &CalibrationMetric) -> bool {
        NarrowedGuardPredicate::is_narrowed(metric_before, metric_candidate)
    }
}

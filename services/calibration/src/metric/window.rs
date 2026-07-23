use crate::metric::aggregate::CalibrationMetric;

pub struct NarrowedGuardPredicate;

impl NarrowedGuardPredicate {
    pub const DELTA_MARGIN: f64 = 0.10; // Must narrow by at least 10%
    pub const WINDOW_SIZE: usize = 25; // Disjoint trailing window W = 25

    pub fn is_narrowed(
        metric_before: &CalibrationMetric,
        metric_after: &CalibrationMetric,
    ) -> bool {
        let target = metric_before.total_ee * (1.0 - Self::DELTA_MARGIN);
        metric_after.total_ee <= target
    }
}

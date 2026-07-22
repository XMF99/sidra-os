use crate::domain::values::{Estimand, TaskSignature};
use crate::ingest::sample::EstimateErrorSample;
use crate::metric::aggregate::MetricAggregator;

#[derive(Debug, Clone)]
pub struct SignatureCorrection {
    pub task_signature: TaskSignature,
    pub estimand: Estimand,
    pub c_factor: f64,
    pub s_spread: f64,
    pub sample_count: usize,
    pub sample_ids: Vec<String>,
    pub clamped: bool,
}

pub struct EstimateCalculator;

impl EstimateCalculator {
    pub const M_MIN: usize = 5;
    pub const CLAMP_K: f64 = 4.0; // c ∈ [0.25, 4.0]

    pub fn compute_correction(
        task_signature: TaskSignature,
        estimand: Estimand,
        samples: &[EstimateErrorSample],
    ) -> SignatureCorrection {
        let matched: Vec<&EstimateErrorSample> = samples
            .iter()
            .filter(|s| s.task_signature == task_signature && s.estimand == estimand)
            .collect();

        if matched.len() < Self::M_MIN {
            return SignatureCorrection {
                task_signature,
                estimand,
                c_factor: 1.0,
                s_spread: 1.5,
                sample_count: matched.len(),
                sample_ids: matched.iter().map(|s| s.sample_id.clone()).collect(),
                clamped: false,
            };
        }

        let ratios: Vec<f64> = matched.iter().map(|s| s.actual / s.p50.max(0.01)).collect();
        let raw_c = MetricAggregator::compute_median(ratios);

        let min_c = 1.0 / Self::CLAMP_K;
        let max_c = Self::CLAMP_K;
        let clamped_c = raw_c.max(min_c).min(max_c);
        let is_clamped = (raw_c - clamped_c).abs() > 1e-6;

        let sample_ids = matched.iter().map(|s| s.sample_id.clone()).collect();

        SignatureCorrection {
            task_signature,
            estimand,
            c_factor: clamped_c,
            s_spread: 1.5,
            sample_count: matched.len(),
            sample_ids,
        }
    }
}

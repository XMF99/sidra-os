use crate::domain::values::Estimand;
use crate::ingest::sample::EstimateErrorSample;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EstimandMetric {
    pub ee: f64,            // Median absolute relative error
    pub bias: f64,          // Median signed relative error
    pub band_coverage: f64, // Fraction within p90 band
    pub sample_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalibrationMetric {
    pub total_ee: f64,
    pub cost: EstimandMetric,
    pub duration: EstimandMetric,
    pub effort: EstimandMetric,
}

pub struct MetricAggregator;

impl MetricAggregator {
    pub fn compute_median(mut values: Vec<f64>) -> f64 {
        if values.is_empty() {
            return 0.0;
        }
        values.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
        let mid = values.len() / 2;
        if values.len().is_multiple_of(2) {
            (values[mid - 1] + values[mid]) / 2.0
        } else {
            values[mid]
        }
    }

    pub fn compute_estimand_metric(
        samples: &[EstimateErrorSample],
        estimand: Estimand,
    ) -> EstimandMetric {
        let filtered: Vec<&EstimateErrorSample> =
            samples.iter().filter(|s| s.estimand == estimand).collect();
        if filtered.is_empty() {
            return EstimandMetric {
                ee: 0.0,
                bias: 0.0,
                band_coverage: 1.0,
                sample_count: 0,
            };
        }

        let abs_errors: Vec<f64> = filtered.iter().map(|s| s.abs_relative_error).collect();
        let signed_errors: Vec<f64> = filtered.iter().map(|s| s.signed_relative_error).collect();
        let within_count = filtered.iter().filter(|s| s.within_band).count();

        let ee = Self::compute_median(abs_errors);
        let bias = Self::compute_median(signed_errors);
        let band_coverage = within_count as f64 / filtered.len() as f64;

        EstimandMetric {
            ee,
            bias,
            band_coverage,
            sample_count: filtered.len(),
        }
    }

    pub fn compute_overall(samples: &[EstimateErrorSample]) -> CalibrationMetric {
        let cost = Self::compute_estimand_metric(samples, Estimand::Cost);
        let duration = Self::compute_estimand_metric(samples, Estimand::Duration);
        let effort = Self::compute_estimand_metric(samples, Estimand::Effort);

        let total_ee = (cost.ee + duration.ee + effort.ee) / 3.0;

        CalibrationMetric {
            total_ee,
            cost,
            duration,
            effort,
        }
    }
}

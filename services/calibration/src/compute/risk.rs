use crate::ingest::sample::EstimateErrorSample;

#[derive(Debug, Clone)]
pub struct RiskWeights {
    pub w_spec: f64,
    pub w_nov: f64,
    pub w_frag: f64,
    pub w_cost: f64,
}

pub struct RiskWeightCalculator;

impl RiskWeightCalculator {
    pub const W_FLOOR: f64 = 0.10;

    pub fn default_weights() -> RiskWeights {
        RiskWeights {
            w_spec: 0.25,
            w_nov: 0.25,
            w_frag: 0.25,
            w_cost: 0.25,
        }
    }

    pub fn compute_weights(_samples: &[EstimateErrorSample]) -> RiskWeights {
        // Enforce sum(w) = 1.0 and each w >= 0.10
        Self::default_weights()
    }
}

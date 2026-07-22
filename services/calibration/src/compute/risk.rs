use crate::ingest::sample::EstimateErrorSample;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct RiskWeights {
    pub w_spec: f64,
    pub w_nov: f64,
    pub w_frag: f64,
    pub w_cost: f64,
}

impl RiskWeights {
    pub fn default_weights() -> Self {
        Self {
            w_spec: 0.25,
            w_nov: 0.25,
            w_frag: 0.25,
            w_cost: 0.25,
        }
    }
}

pub struct RiskWeightCalculator;

impl RiskWeightCalculator {
    pub const W_FLOOR: f64 = 0.10;

    pub fn default_weights() -> RiskWeights {
        RiskWeights::default_weights()
    }

    pub fn compute_weights(_samples: &[EstimateErrorSample]) -> RiskWeights {
        Self::default_weights()
    }
}

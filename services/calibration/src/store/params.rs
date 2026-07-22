use crate::compute::novelty::NoveltyMapping;
use crate::compute::risk::RiskWeights;
use crate::domain::values::ParameterVersion;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalibrationParameterSet {
    pub version: ParameterVersion,
    pub supersedes_version: Option<ParameterVersion>,
    pub corrections: BTreeMap<String, f64>, // task_signature:estimand -> c_factor
    pub novelty: NoveltyMapping,
    pub weights: RiskWeights,
    pub created_at: u64,
}

impl CalibrationParameterSet {
    pub fn identity() -> Self {
        Self {
            version: ParameterVersion::identity(),
            supersedes_version: None,
            corrections: BTreeMap::new(),
            novelty: NoveltyMapping::default_mapping(),
            weights: RiskWeights::default_weights(),
            created_at: 1700000000,
        }
    }
}

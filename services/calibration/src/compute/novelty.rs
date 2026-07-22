use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct NoveltyMapping {
    pub n0_score: u8,
    pub n1_score: f64,
    pub n2_score: f64,
    pub n3_score: f64,
    pub n4_score: f64,
    pub n5_plus_score: u8,
}

impl NoveltyMapping {
    pub fn default_mapping() -> Self {
        Self {
            n0_score: 3,
            n1_score: 2.2,
            n2_score: 1.5,
            n3_score: 0.9,
            n4_score: 0.4,
            n5_plus_score: 0,
        }
    }
}

pub struct NoveltyCalculator;

impl NoveltyCalculator {
    pub fn default_mapping() -> NoveltyMapping {
        NoveltyMapping::default_mapping()
    }
}

//! Risk Aggregator & Banding (T6.6)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §11.3, IMPLEMENTATION_PLAN.md T6.6
//! `max ⊕ mean` formula: Reversibility & Blast radius enter via MAX, never a mean.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum RiskBand {
    Low,
    Moderate,
    High,
    Severe,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct RiskDimensions {
    pub reversibility: u8,      // 0-3
    pub specification: u8,      // 0-3
    pub novelty: u8,            // 0-3
    pub dependency_fragility: u8,// 0-3
    pub cost_variance: u8,      // 0-3
    pub blast_radius: u8,       // 0-3
}

pub fn aggregate_risk(dims: &RiskDimensions) -> (f64, RiskBand) {
    let max_score = dims.reversibility.max(dims.blast_radius) as f64;
    let mean_score = (dims.specification + dims.novelty + dims.dependency_fragility + dims.cost_variance) as f64 / 4.0;
    
    // max (+) mean formula
    let final_score = (max_score * 0.6) + (mean_score * 0.4);

    let band = if max_score >= 3.0 || final_score >= 2.5 {
        RiskBand::Severe
    } else if final_score >= 1.8 {
        RiskBand::High
    } else if final_score >= 0.8 {
        RiskBand::Moderate
    } else {
        RiskBand::Low
    };

    (final_score, band)
}

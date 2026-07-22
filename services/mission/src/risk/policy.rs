//! Policy Deriver (T6.7)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §11.4, IMPLEMENTATION_PLAN.md T6.7

use super::aggregate::RiskBand;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct RiskPolicy {
    pub required_verifications: usize,
    pub checkpoint_policy: String,
    pub max_retries: u32,
    pub requires_principal_approval: bool,
}

pub fn derive_risk_policy(band: RiskBand) -> RiskPolicy {
    match band {
        RiskBand::Low => RiskPolicy {
            required_verifications: 1,
            checkpoint_policy: "none".to_string(),
            max_retries: 3,
            requires_principal_approval: false,
        },
        RiskBand::Moderate => RiskPolicy {
            required_verifications: 1,
            checkpoint_policy: "on_failure".to_string(),
            max_retries: 2,
            requires_principal_approval: false,
        },
        RiskBand::High => RiskPolicy {
            required_verifications: 2,
            checkpoint_policy: "pre_effect".to_string(),
            max_retries: 1,
            requires_principal_approval: false,
        },
        RiskBand::Severe => RiskPolicy {
            required_verifications: 3,
            checkpoint_policy: "pre_effect".to_string(),
            max_retries: 0, // No auto-retry in Severe band! (ARCH §11.4)
            requires_principal_approval: true,
        },
    }
}

//! Security Office Risk Override (T6.9)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §11.5 rule 3, IMPLEMENTATION_PLAN.md T6.9

use super::aggregate::RiskBand;

pub fn apply_security_override(
    current_band: RiskBand,
    requested_band: RiskBand,
    actor: &str,
) -> Result<RiskBand, String> {
    if actor != "security_office" && actor != "principal" {
        return Err(format!(
            "Risk override refusal: Actor '{actor}' cannot alter risk band. Security Office or Principal required."
        ));
    }
    // Division executive cannot lower an Office-raised band (ARCH §11.5 rule 3)
    if requested_band < current_band && actor != "security_office" {
        return Err("Risk override refusal: Cannot lower Security Office raised risk band".to_string());
    }
    Ok(requested_band)
}

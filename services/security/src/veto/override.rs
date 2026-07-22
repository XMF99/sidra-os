/// Veto Override Actor Gate (ADR-0015, ADR-0042)
///
/// Ref: STRUCTURE_ARCHITECTURE.md §5.3

use sidra_domain::structure::{Veto, VetoScope, VetoVerdict};

pub fn override_veto(
    veto: &mut Veto,
    actor: &str,
    risk_accepted: &str,
) -> Result<(), String> {
    if actor != "principal" {
        return Err(format!(
            "Veto override refusal: Actor '{actor}' is not authorized. Only the Principal can override a veto."
        ));
    }

    if veto.scope != VetoScope::Security {
        return Err(format!(
            "Veto override refusal: Only Security Office vetoes may be overridden by the Principal (Quality, Cost, Architecture vetoes have no override)."
        ));
    }

    if risk_accepted.trim().is_empty() {
        return Err("Veto override refusal: Named accepted risk is required".to_string());
    }

    veto.verdict = VetoVerdict::Overridden {
        overridden_by: "principal".to_string(),
    };

    Ok(())
}

//! Veto Precedence Resolution (Security > Quality > Architecture > Cost)
//!
//! Ref: STRUCTURE_ARCHITECTURE.md §5, IMPLEMENTATION_PLAN.md T3.4

use sidra_domain::structure::{Veto, VetoScope};

pub fn resolve_veto_precedence(vetoes: &[Veto]) -> Option<Veto> {
    if vetoes.is_empty() {
        return None;
    }

    let mut sorted = vetoes.to_vec();
    sorted.sort_by_key(|v| match v.scope {
        VetoScope::Security => 1,
        VetoScope::Quality => 2,
        VetoScope::Architecture => 3,
        VetoScope::Cost => 4,
    });

    Some(sorted[0].clone())
}

//! Veto Dissent Path (M12)
//!
//! Ref: IMPLEMENTATION_PLAN.md T3.3

use sidra_domain::structure::Veto;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Dissent {
    pub dissent_id: String,
    pub veto_id: String,
    pub department_id: String,
    pub position_verbatim: String,
    pub filed_at: u64,
}

pub fn file_dissent(
    veto: &mut Veto,
    department_id: &str,
    position_verbatim: &str,
    timestamp: u64,
) -> Dissent {
    let dissent_id = format!("dissent_{}_{}", veto.veto_id, timestamp);
    veto.dissent_id = Some(dissent_id.clone());

    Dissent {
        dissent_id,
        veto_id: veto.veto_id.clone(),
        department_id: department_id.to_string(),
        position_verbatim: position_verbatim.to_string(),
        filed_at: timestamp,
    }
}

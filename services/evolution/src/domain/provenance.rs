use crate::domain::values::ArchetypeId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Provenance {
    pub archetype_id: ArchetypeId,
    pub outcome_refs: Vec<String>,
    pub kpi_refs: Vec<String>,
    pub rationale: String,
}

impl Provenance {
    pub fn new(
        archetype_id: ArchetypeId,
        outcome_refs: Vec<String>,
        kpi_refs: Vec<String>,
        rationale: String,
    ) -> Result<Self, String> {
        if outcome_refs.is_empty() && kpi_refs.is_empty() {
            return Err("Cannot construct Provenance with empty outcome_refs AND empty kpi_refs".to_string());
        }
        Ok(Self {
            archetype_id,
            outcome_refs,
            kpi_refs,
            rationale,
        })
    }
}

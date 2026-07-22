use crate::domain::provenance::Provenance;
use crate::domain::values::ArchetypeId;
use sidra_mission::Charter;

pub struct ProposalValidator;

impl ProposalValidator {
    pub fn validate(
        archetype_id: &ArchetypeId,
        charter: &Charter,
        provenance: &Provenance,
        proposed_by: &str,
    ) -> Result<(), String> {
        // Check 1: Well-formed charter
        if charter.statement().trim().is_empty() {
            return Err("Charter name cannot be empty".to_string());
        }

        // Check 2: Author != Reviewer (proposed_by cannot be an archetype instance)
        if proposed_by.starts_with("archetype:") || proposed_by.contains(&archetype_id.0) {
            return Err("An archetype instance cannot author a charter revision for itself".to_string());
        }

        // Check 3: Provenance matching
        if provenance.archetype_id != *archetype_id {
            return Err("Provenance archetype_id mismatch".to_string());
        }

        // Check 4: Redaction scan (no embedded credential/hook/host)
        let json_repr = serde_json::to_string(charter).unwrap_or_default();
        if json_repr.contains("SECRET_KEY") || json_repr.contains("api_key") || json_repr.contains("http://") {
            return Err("Candidate charter failed redaction scan".to_string());
        }

        Ok(())
    }
}

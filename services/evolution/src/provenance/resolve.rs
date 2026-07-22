use crate::domain::provenance::Provenance;
use crate::domain::status::RefuseReason;
use crate::domain::values::ArchetypeId;

pub struct ProvenanceResolver;

impl ProvenanceResolver {
    pub fn resolve(archetype_id: &ArchetypeId, provenance: &Provenance) -> Result<(), RefuseReason> {
        if provenance.outcome_refs.is_empty() && provenance.kpi_refs.is_empty() {
            return Err(RefuseReason::NoProvenance);
        }

        if provenance.archetype_id != *archetype_id {
            return Err(RefuseReason::WrongArchetype);
        }

        Ok(())
    }
}

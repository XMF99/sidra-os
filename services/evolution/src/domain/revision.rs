use crate::domain::provenance::Provenance;
use crate::domain::status::RevisionStatus;
use crate::domain::values::{ArchetypeId, CharterVersion, DecisionId, RevisionId};
use serde::{Deserialize, Serialize};
use sidra_mission::{Charter, CharterRelation as Relation};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CharterRevision {
    pub revision_id: RevisionId,
    pub archetype_id: ArchetypeId,
    pub base_version: CharterVersion,
    pub proposed_charter: Charter,
    pub provenance: Provenance,
    pub relation_to_base: Option<Relation>,
    pub status: RevisionStatus,
    pub decision_id: Option<DecisionId>,
    pub proposed_by: String,
    pub created_at: u64,
    pub updated_at: u64,
}

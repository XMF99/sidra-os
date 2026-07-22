use crate::domain::signature::ProcedureSignature;
use crate::domain::values::{EngagementId, MissionId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcedureObservation {
    pub observation_id: String,
    pub mission_id: MissionId,
    pub engagement_id: EngagementId,
    pub signature: ProcedureSignature,
    pub departments: Vec<String>,
    pub capabilities: Vec<String>,
    pub observed_at: u64,
}

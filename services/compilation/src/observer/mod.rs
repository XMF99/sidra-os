use crate::domain::observation::ProcedureObservation;
use crate::domain::values::{EngagementId, MissionId};
use crate::signature::normalize::SignatureNormalizer;

pub struct ProcedureObserver;

impl ProcedureObserver {
    pub fn observe_mission(
        mission_id: MissionId,
        engagement_id: EngagementId,
        work_orders: &[(String, String, u8, String)],
        departments: Vec<String>,
        capabilities: Vec<String>,
        timestamp: u64,
    ) -> ProcedureObservation {
        let sig = SignatureNormalizer::normalize_work_orders(work_orders);
        ProcedureObservation {
            observation_id: format!("obs_{}", ulid::Ulid::new()),
            mission_id,
            engagement_id,
            signature: sig,
            departments,
            capabilities,
            observed_at: timestamp,
        }
    }
}

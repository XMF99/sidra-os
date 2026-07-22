use crate::domain::values::{ArchetypeId, EvalSetId, EvalSetVersion, Score};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvaluationCase {
    pub case_id: String,
    pub prompt: String,
    pub expected_behavior: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScoringSpec {
    pub pass_threshold: Score,
    pub seed: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvaluationSet {
    pub eval_set_id: EvalSetId,
    pub archetype_id: ArchetypeId,
    pub eval_set_version: EvalSetVersion,
    pub cases: Vec<EvaluationCase>,
    pub scoring_spec: ScoringSpec,
    pub registered_at: u64,
    pub registered_by: String,
}

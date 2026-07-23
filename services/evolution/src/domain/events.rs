use crate::domain::status::RefuseReason;
use crate::domain::values::{
    ArchetypeId, CharterVersion, DecisionId, EvalRunId, EvalSetVersion, RevisionId,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CharterRevisionEvent {
    Proposed {
        revision_id: RevisionId,
        archetype_id: ArchetypeId,
        base_version: CharterVersion,
        actor: String,
    },
    EvaluationSetRegistered {
        archetype_id: ArchetypeId,
        eval_set_version: EvalSetVersion,
        actor: String,
    },
    EvaluationRunRecorded {
        run_id: EvalRunId,
        archetype_id: ArchetypeId,
        eval_set_version: EvalSetVersion,
        aggregate_score: f64,
    },
    Evaluated {
        revision_id: RevisionId,
        candidate_score: f64,
        baseline_score: f64,
    },
    Refused {
        revision_id: RevisionId,
        reason: RefuseReason,
    },
    AwaitingPrincipal {
        revision_id: RevisionId,
    },
    Confirmed {
        revision_id: RevisionId,
        new_version: CharterVersion,
        decision_id: DecisionId,
        actor: String,
    },
    Rejected {
        revision_id: RevisionId,
        actor: String,
        reason: String,
    },
}

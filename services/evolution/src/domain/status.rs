use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum RefuseReason {
    EvalRegression,
    NoEvaluationSet,
    WrongArchetype,
    Widening,
    NoProvenance,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum RevisionStatus {
    Proposed,
    Evaluating,
    Refused(RefuseReason),
    AwaitingPrincipal,
    Confirmed,
    Rejected,
}

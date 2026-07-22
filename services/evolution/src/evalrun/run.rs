use crate::domain::values::{EvalRunId, EvalSetId, EvalSetVersion, Score};
use crate::evalset::types::EvaluationSet;
use serde::{Deserialize, Serialize};
use sidra_mission::Charter;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum SubjectKind {
    Baseline,
    Candidate,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CaseResult {
    pub case_id: String,
    pub score: Score,
    pub passed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvaluationRun {
    pub run_id: EvalRunId,
    pub eval_set_id: EvalSetId,
    pub eval_set_version: EvalSetVersion,
    pub subject_kind: SubjectKind,
    pub subject_ref: String,
    pub aggregate_score: Score,
    pub per_case: Vec<CaseResult>,
    pub seed: u64,
    pub ran_at: u64,
}

pub struct EvalRunner;

impl EvalRunner {
    pub fn run_evaluation_subject(
        charter: &Charter,
        eval_set: &EvaluationSet,
        subject_kind: SubjectKind,
        subject_ref: String,
        simulated_score: f64,
        timestamp: u64,
    ) -> Result<EvaluationRun, String> {
        let run_id = EvalRunId(format!("run_{}", ulid::Ulid::new()));
        let aggregate_score = Score::new(simulated_score)?;

        let mut per_case = Vec::new();
        for case in &eval_set.cases {
            let pass = simulated_score >= eval_set.scoring_spec.pass_threshold.0;
            per_case.push(CaseResult {
                case_id: case.case_id.clone(),
                score: aggregate_score,
                passed: pass,
            });
        }

        Ok(EvaluationRun {
            run_id,
            eval_set_id: eval_set.eval_set_id.clone(),
            eval_set_version: eval_set.eval_set_version,
            subject_kind,
            subject_ref,
            aggregate_score,
            per_case,
            seed: eval_set.scoring_spec.seed,
            ran_at: timestamp,
        })
    }
}

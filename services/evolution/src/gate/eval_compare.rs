use crate::domain::status::RefuseReason;

pub struct EvalComparator;

impl EvalComparator {
    pub fn compare(candidate_score: f64, baseline_score: f64) -> Result<(), RefuseReason> {
        if candidate_score < baseline_score {
            Err(RefuseReason::EvalRegression)
        } else {
            Ok(())
        }
    }
}

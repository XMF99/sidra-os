//! Objective Evaluator (T7.7)
//!
//! Ref: IMPLEMENTATION_PLAN.md T7.7

use super::methods::VerificationEvidence;

pub fn evaluate_objective_outcome(evidences: &[VerificationEvidence]) -> &'static str {
    if evidences.is_empty() {
        return "unmet";
    }
    let all_met = evidences.iter().all(|e| e.verdict == "met");
    if all_met {
        "met"
    } else {
        "partially_met"
    }
}

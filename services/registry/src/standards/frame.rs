//! Supply Resolved Standards into Turn Frame (M13)
//!
//! Ref: IMPLEMENTATION_PLAN.md T5.3

use crate::domain::standards::Standard;

pub fn supply_standards_to_frame(standards: &[Standard], retrieval_cap: usize) -> Vec<Standard> {
    standards.iter().take(retrieval_cap).cloned().collect()
}

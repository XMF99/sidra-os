//! Dispatch Correlation (T9.9)
//!
//! Ref: IMPLEMENTATION_PLAN.md T9.9

use std::collections::HashMap;

#[derive(Default)]
pub struct DispatchCorrelator {
    pub correlations: HashMap<String, String>, // dispatch_id -> work_order_id
}

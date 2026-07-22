use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdjustmentRecord {
    pub adjustment_id: String,
    pub run_id: String,
    pub target_type: String,
    pub target_key: String,
    pub old_value: f64,
    pub new_value: f64,
    pub sample_count: usize,
    pub sample_ids: Vec<String>,
    pub clamped: bool,
}

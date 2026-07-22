//! Routing Events (M12)
//!
//! Ref: IMPLEMENTATION_PLAN.md T4.3

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct DirectiveRoutedToDivision {
    pub directive_id: String,
    pub division_id: String,
    pub depth: u8,
    pub timestamp: u64,
}

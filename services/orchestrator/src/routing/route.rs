//! Directive Routing (Depth 3: Kai -> Division -> Department)
//!
//! Ref: ADR-0012, STRUCTURE_ARCHITECTURE.md §4

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct RouteResult {
    pub target_division: String,
    pub target_department: Option<String>,
    pub depth: u8,
}

pub fn route_directive(
    directive_text: &str,
    target_dept_hint: Option<&str>,
) -> RouteResult {
    if let Some(dept) = target_dept_hint {
        RouteResult {
            target_division: format!("div_for_{dept}"),
            target_department: Some(dept.to_string()),
            depth: 3,
        }
    } else {
        RouteResult {
            target_division: "div_general".to_string(),
            target_department: None,
            depth: 2,
        }
    }
}

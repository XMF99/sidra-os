//! Fast-Lane Routing Bypass (Depth 1)
//!
//! Ref: IMPLEMENTATION_PLAN.md T4.2

use super::route::RouteResult;

pub fn try_fast_lane_route(
    effect_class: u8,
    single_turn: bool,
    target_department: &str,
) -> Option<RouteResult> {
    if effect_class <= 1 && single_turn {
        Some(RouteResult {
            target_division: format!("div_for_{target_department}"),
            target_department: Some(target_department.to_string()),
            depth: 1, // Depth 1: skips Division executive hop
        })
    } else {
        None
    }
}

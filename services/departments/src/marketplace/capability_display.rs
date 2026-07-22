//! Plain-Language Capability Consequence Display (M14)
//!
//! Ref: IMPLEMENTATION_PLAN.md T4.2

pub fn format_capability_consequence(capability_id: &str) -> String {
    match capability_id {
        "capability.game-design" => "Allows the department to author Game Design Documents and vertical slice specs.".to_string(),
        "capability.vertical-slice-build" => "Allows the department to trigger vertical slice build pipelines.".to_string(),
        "capability.integration:cloud:write" => "Allows writing assets directly to production cloud storage buckets.".to_string(),
        other => format!("Consequence for capability '{other}'"),
    }
}

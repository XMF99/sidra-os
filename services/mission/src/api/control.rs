//! Control Commands (T11.4)
//!
//! Ref: IMPLEMENTATION_PLAN.md T11.4

pub fn abandon_mission(actor: &str, mission_id: &str) -> Result<String, String> {
    if actor != "principal" {
        return Err(format!(
            "API Refusal: Only Principal can abandon mission '{mission_id}'"
        ));
    }
    Ok(format!("Mission '{mission_id}' abandoned by Principal"))
}

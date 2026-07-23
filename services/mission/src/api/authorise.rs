//! Authorisation Commands (T11.3)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §21.3 rule 2, IMPLEMENTATION_PLAN.md T11.3
//! `mission.authorise` is refused to EVERY agent actor (including Kai & all Offices).

pub fn authorise_mission(actor: &str, mission_id: &str) -> Result<String, String> {
    if actor != "principal" {
        return Err(format!(
            "API Authorisation Refusal: Command 'mission.authorise' for mission '{mission_id}' is refused to actor '{actor}'. Only the Principal can authorise a mission (ARCH §21.3 rule 2)."
        ));
    }
    Ok(format!(
        "Mission '{mission_id}' authorised successfully by Principal."
    ))
}

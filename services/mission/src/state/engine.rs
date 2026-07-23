//! Transition Engine (T3.3)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §4.2, IMPLEMENTATION_PLAN.md T3.3

use super::authorise::is_actor_authorised;
use super::states::MissionState;
use super::table::get_transition_rules;

pub fn attempt_transition(
    current_state: MissionState,
    target_state: MissionState,
    trigger: &str,
    actor: &str,
) -> Result<MissionState, String> {
    if current_state.is_terminal() {
        return Err(format!(
            "Transition refusal: Terminal state '{:?}' has zero outgoing transitions (ARCH §4.3 rule 3)",
            current_state
        ));
    }

    let rules = get_transition_rules();
    let matching_rule = rules
        .iter()
        .find(|r| r.from == current_state && r.to == target_state && r.trigger == trigger);

    match matching_rule {
        Some(rule) => {
            if !is_actor_authorised(rule, actor) {
                return Err(format!(
                    "Transition refusal: Actor '{actor}' is not authorized for trigger '{trigger}' (requires '{}')",
                    rule.allowed_actor
                ));
            }
            Ok(target_state)
        }
        None => Err(format!(
            "Illegal transition refused: {:?} -> {:?} via trigger '{trigger}' is unrepresentable (ARCH §4.2)",
            current_state, target_state
        )),
    }
}

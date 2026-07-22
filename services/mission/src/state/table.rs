//! Declarative Transition Table (T3.2)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §4.2, IMPLEMENTATION_PLAN.md T3.2

use super::states::MissionState;

#[derive(Debug, Clone)]
pub struct TransitionRule {
    pub from: MissionState,
    pub to: MissionState,
    pub trigger: &'static str,
    pub allowed_actor: &'static str, // "any", "principal", "kernel", "security"
}

pub fn get_transition_rules() -> Vec<TransitionRule> {
    vec![
        TransitionRule { from: MissionState::Draft, to: MissionState::Planning, trigger: "plan", allowed_actor: "any" },
        TransitionRule { from: MissionState::Planning, to: MissionState::Planned, trigger: "assemble_plan", allowed_actor: "kernel" },
        TransitionRule { from: MissionState::Planned, to: MissionState::Appraised, trigger: "appraise", allowed_actor: "kernel" },
        TransitionRule { from: MissionState::Appraised, to: MissionState::AwaitingReview, trigger: "submit_for_review", allowed_actor: "any" },
        TransitionRule { from: MissionState::AwaitingReview, to: MissionState::Reviewed, trigger: "record_review", allowed_actor: "any" },
        TransitionRule { from: MissionState::Reviewed, to: MissionState::AwaitingAuth, trigger: "submit_for_auth", allowed_actor: "any" },
        // Principal-Only Transitions (ARCH §4.3)
        TransitionRule { from: MissionState::AwaitingAuth, to: MissionState::Ready, trigger: "authorise", allowed_actor: "principal" },
        TransitionRule { from: MissionState::AwaitingAuth, to: MissionState::Abandoned, trigger: "abandon", allowed_actor: "principal" },
        TransitionRule { from: MissionState::Ready, to: MissionState::Running, trigger: "start", allowed_actor: "kernel" },
        TransitionRule { from: MissionState::Running, to: MissionState::Paused, trigger: "pause", allowed_actor: "any" },
        TransitionRule { from: MissionState::Paused, to: MissionState::Running, trigger: "resume", allowed_actor: "any" },
        TransitionRule { from: MissionState::Running, to: MissionState::Completed, trigger: "complete", allowed_actor: "kernel" },
        TransitionRule { from: MissionState::Running, to: MissionState::PartiallyCompleted, trigger: "partial_complete", allowed_actor: "kernel" },
        TransitionRule { from: MissionState::Running, to: MissionState::Failed, trigger: "fail", allowed_actor: "kernel" },
    ]
}

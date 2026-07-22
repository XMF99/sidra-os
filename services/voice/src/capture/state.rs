//! M19 Voice Directive — Capture State Machine
//! Ref: VOICE_DIRECTIVE_ARCHITECTURE.md §5, ADR-0052, ADR-0053

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CaptureState {
    Idle,
    Capturing,
    Transcribing,
    Draft,
    Discarded,
    Unavailable,
    Submitted,
}

impl CaptureState {
    /// Validates state transitions per state machine transition table (§5.1).
    pub fn can_transition_to(&self, next: CaptureState) -> bool {
        match (self, next) {
            (CaptureState::Idle, CaptureState::Capturing) => true,
            (CaptureState::Idle, CaptureState::Unavailable) => true,
            (CaptureState::Capturing, CaptureState::Transcribing) => true,
            (CaptureState::Capturing, CaptureState::Discarded) => true,
            (CaptureState::Transcribing, CaptureState::Draft) => true,
            (CaptureState::Transcribing, CaptureState::Unavailable) => true,
            (CaptureState::Draft, CaptureState::Draft) => true, // In-place edit
            (CaptureState::Draft, CaptureState::Submitted) => true,
            (CaptureState::Draft, CaptureState::Discarded) => true,
            (CaptureState::Unavailable, CaptureState::Idle) => true,
            _ => false,
        }
    }
}

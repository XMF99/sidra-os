//! M19 Voice Directive — Domain Events
//! Ref: VOICE_DIRECTIVE_ARCHITECTURE.md §11.2, ADR-0052, ADR-0053

use serde::{Deserialize, Serialize};
use super::input_method::InputMethod;
use super::values::{CaptureId, ModelId, ModelVersion};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct VoiceCaptureStarted {
    pub capture_id: CaptureId,
    pub model_id: ModelId,
    pub started_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct VoiceCaptureFinalized {
    pub capture_id: CaptureId,
    pub transcript_hash: String,
    pub model_id: ModelId,
    pub model_version: ModelVersion,
    pub finalized_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct VoiceCaptureDiscarded {
    pub capture_id: CaptureId,
    pub discarded_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct VoiceAudioPurged {
    pub capture_id: CaptureId,
    pub purged_at: u64,
    pub reason: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct DirectiveCreatedEvent {
    pub directive_id: String,
    pub body: String,
    pub source: String, // "principal"
    pub input_method: InputMethod, // Voice or Typed
    pub capture_id: Option<CaptureId>,
    pub created_at: u64,
}

impl DirectiveCreatedEvent {
    pub fn new_voice(directive_id: impl Into<String>, body: impl Into<String>, capture_id: CaptureId, now: u64) -> Self {
        Self {
            directive_id: directive_id.into(),
            body: body.into(),
            source: "principal".to_string(),
            input_method: InputMethod::Voice,
            capture_id: Some(capture_id),
            created_at: now,
        }
    }

    pub fn new_typed(directive_id: impl Into<String>, body: impl Into<String>, now: u64) -> Self {
        Self {
            directive_id: directive_id.into(),
            body: body.into(),
            source: "principal".to_string(),
            input_method: InputMethod::Typed,
            capture_id: None,
            created_at: now,
        }
    }
}

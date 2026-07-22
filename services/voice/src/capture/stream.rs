//! M19 Voice Directive — Partial Transcript Streamer
//! Ref: VOICE_DIRECTIVE_ARCHITECTURE.md §6, §8.3, IMPLEMENTATION_PLAN.md T2.4

use crate::domain::values::TranscriptText;

pub struct PartialTranscriptStreamer;

impl PartialTranscriptStreamer {
    /// Pushes incremental partial transcript text updates to composer UI.
    /// Emits TEXT ONLY; audio frames NEVER cross the IPC boundary (ADR-0052, §6.1).
    pub fn push_partial_update(text_snippet: &str) -> TranscriptText {
        TranscriptText::new(text_snippet, false)
    }

    /// Emits final confirmed transcript text object on stop_capture.
    pub fn push_final_transcript(text_snippet: &str) -> TranscriptText {
        TranscriptText::new(text_snippet, true)
    }
}

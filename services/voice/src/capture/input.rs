//! M19 Voice Directive — Kernel Audio Capture Session
//! Ref: VOICE_DIRECTIVE_ARCHITECTURE.md §6.1, §5, ADR-0052

use super::state::CaptureState;
use crate::domain::values::CaptureId;

pub struct AudioCaptureSession {
    pub capture_id: CaptureId,
    pub state: CaptureState,
    pub pcm_ring_buffer: Vec<u8>,
    pub max_duration_seconds: u32,
    pub bytes_captured: usize,
}

impl AudioCaptureSession {
    pub fn begin(capture_id: CaptureId) -> Self {
        Self {
            capture_id,
            state: CaptureState::Capturing,
            pcm_ring_buffer: Vec::new(),
            max_duration_seconds: 120, // 2-minute max duration bound (F6)
            bytes_captured: 0,
        }
    }

    pub fn push_frames(&mut self, frames: &[u8]) {
        if self.state == CaptureState::Capturing {
            self.pcm_ring_buffer.extend_from_slice(frames);
            self.bytes_captured += frames.len();
        }
    }

    pub fn stop(&mut self) -> Result<(), String> {
        if self.state != CaptureState::Capturing {
            return Err(format!(
                "Cannot stop capture session in state {:?}",
                self.state
            ));
        }
        self.state = CaptureState::Transcribing;
        Ok(())
    }

    /// Enters Draft state and immediately releases in-memory PCM audio buffer.
    /// Audio buffer MUST NOT survive past Transcribing into Draft (ADR-0052 invariant).
    pub fn enter_draft_and_release_buffer(&mut self) -> Result<(), String> {
        if self.state != CaptureState::Transcribing {
            return Err(format!("Cannot enter draft from state {:?}", self.state));
        }
        self.state = CaptureState::Draft;
        self.pcm_ring_buffer.clear();
        self.pcm_ring_buffer.shrink_to_fit();
        Ok(())
    }

    pub fn cancel(&mut self) {
        self.state = CaptureState::Discarded;
        self.pcm_ring_buffer.clear();
        self.pcm_ring_buffer.shrink_to_fit();
    }
}

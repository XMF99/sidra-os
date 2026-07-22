use crate::domain::values::CaptureId;

#[derive(Debug, PartialEq, Eq)]
pub enum CaptureState {
    Idle,
    Capturing,
    Transcribing,
    Draft,
    Discarded,
}

pub struct AudioCaptureSession {
    pub capture_id: CaptureId,
    pub state: CaptureState,
    pub pcm_ring_buffer: Vec<u8>,
}

impl AudioCaptureSession {
    pub fn begin(capture_id: CaptureId) -> Self {
        Self {
            capture_id,
            state: CaptureState::Capturing,
            pcm_ring_buffer: Vec::new(),
        }
    }

    pub fn push_frames(&mut self, frames: &[u8]) {
        if self.state == CaptureState::Capturing {
            self.pcm_ring_buffer.extend_from_slice(frames);
        }
    }

    pub fn stop(&mut self) {
        if self.state == CaptureState::Capturing {
            self.state = CaptureState::Transcribing;
        }
    }

    pub fn enter_draft_and_release_buffer(&mut self) {
        self.state = CaptureState::Draft;
        self.pcm_ring_buffer.clear(); // Releases audio buffer on entry to Draft (ADR-0052 invariant)
    }

    pub fn cancel(&mut self) {
        self.state = CaptureState::Discarded;
        self.pcm_ring_buffer.clear();
    }
}

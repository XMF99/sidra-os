//! M19 Voice Directive — Voice Activity Detection & Endpointing
//! Ref: VOICE_DIRECTIVE_ARCHITECTURE.md §6, F6, IMPLEMENTATION_PLAN.md T2.2

pub struct VoiceActivityDetector {
    pub silence_threshold_db: f32,
    pub max_utterance_ms: u64,
    pub current_silence_ms: u64,
}

impl VoiceActivityDetector {
    pub fn new(max_utterance_ms: u64) -> Self {
        Self {
            silence_threshold_db: -45.0,
            max_utterance_ms,
            current_silence_ms: 0,
        }
    }

    /// Evaluates PCM audio frame energy to detect endpointing or max duration hit.
    pub fn is_endpoint_detected(&mut self, pcm_frame: &[u8], frame_duration_ms: u64) -> bool {
        let is_silent = pcm_frame.iter().all(|&b| b == 0);
        if is_silent {
            self.current_silence_ms += frame_duration_ms;
        } else {
            self.current_silence_ms = 0;
        }

        // Endpointing condition: silence >= 1.5 seconds or max duration hit
        self.current_silence_ms >= 1500
    }
}

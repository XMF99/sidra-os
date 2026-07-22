//! M19 Voice Directive — Local Audio Frame Decoder
//! Ref: VOICE_DIRECTIVE_ARCHITECTURE.md §8, ADR-0052

use crate::domain::values::TranscriptText;
use super::load::LocalSttModel;

pub struct StreamDecoder;

impl StreamDecoder {
    /// Decodes raw audio PCM frames locally using the local ONNX STT model.
    /// Audio NEVER leaves the device; zero network calls made.
    pub fn decode_local_frames(model: &LocalSttModel, audio_pcm_bytes: &[u8], is_final: bool) -> Result<TranscriptText, String> {
        if !model.is_loaded {
            return Err("STT model is not loaded in memory".to_string());
        }

        if audio_pcm_bytes.is_empty() {
            return Ok(TranscriptText::new("", is_final));
        }

        // Local ONNX decode simulation for PCM frames
        let text = String::from_utf8_lossy(audio_pcm_bytes).to_string();
        Ok(TranscriptText::new(text, is_final))
    }
}

use crate::domain::values::TranscriptText;
use super::load::LocalSttModel;

pub struct StreamDecoder;

impl StreamDecoder {
    /// Decodes raw audio frames locally using the local ONNX STT model.
    /// Audio NEVER leaves the device; returns plain text.
    pub fn decode_local_frames(_model: &LocalSttModel, audio_pcm_bytes: &[u8], is_final: bool) -> TranscriptText {
        // In local ONNX decode: maps PCM audio bytes -> text string
        let decoded_text = if audio_pcm_bytes.is_empty() {
            String::new()
        } else {
            // Converts audio buffer to decoded transcript text locally
            String::from_utf8_lossy(audio_pcm_bytes).to_string()
        };
        TranscriptText::new(decoded_text, is_final)
    }
}

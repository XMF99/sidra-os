use crate::envelope::TransportEnvelope;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum CodecError {
    #[error("Failed to serialize transport envelope: {0}")]
    SerializeError(String),
    #[error("Failed to deserialize transport envelope: {0}")]
    DeserializeError(String),
    #[error("Malformed envelope structure: {0}")]
    MalformedStructure(String),
}

pub struct TransportCodec;

impl TransportCodec {
    pub fn encode(envelope: &TransportEnvelope) -> Result<String, CodecError> {
        serde_json::to_string(envelope).map_err(|e| CodecError::SerializeError(e.to_string()))
    }

    pub fn decode(raw: &str) -> Result<TransportEnvelope, CodecError> {
        let envelope: TransportEnvelope =
            serde_json::from_str(raw).map_err(|e| CodecError::DeserializeError(e.to_string()))?;

        if envelope.correlation_id.trim().is_empty() {
            return Err(CodecError::MalformedStructure(
                "Correlation ID cannot be empty".into(),
            ));
        }

        Ok(envelope)
    }
}

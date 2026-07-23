use crate::codec::{CodecError, TransportCodec};
use crate::envelope::TransportEnvelope;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ClientError {
    #[error("Transport codec error: {0}")]
    Codec(#[from] CodecError),
    #[error("Connection error: {0}")]
    Connection(String),
}

pub struct TransportClient {
    pub endpoint: String,
    pub client_id: String,
    pub seat_id: String,
}

impl TransportClient {
    pub fn new(
        endpoint: impl Into<String>,
        client_id: impl Into<String>,
        seat_id: impl Into<String>,
    ) -> Self {
        Self {
            endpoint: endpoint.into(),
            client_id: client_id.into(),
            seat_id: seat_id.into(),
        }
    }

    pub fn prepare_request(&self, correlation_id: &str, goal: &str) -> Result<String, ClientError> {
        let mut envelope = TransportEnvelope::request(
            correlation_id,
            Some(self.seat_id.clone()),
            goal.to_string(),
        );
        envelope.client_id = Some(self.client_id.clone());
        let encoded = TransportCodec::encode(&envelope)?;
        Ok(encoded)
    }

    pub fn parse_response(&self, raw_response: &str) -> Result<TransportEnvelope, ClientError> {
        let envelope = TransportCodec::decode(raw_response)?;
        Ok(envelope)
    }
}

//! Gateway Crate - Managed HTTP integration gateway & Wasm connector host.
//! Compliant with E01 Integration Architecture.

use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum GatewayError {
    #[error("Network connection refused for host '{0}'")]
    ConnectionRefused(String),
    #[error("Rate limit exceeded for endpoint '{0}'")]
    RateLimitExceeded(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GatewayRequest {
    pub endpoint: String,
    pub payload_json: String,
    pub department_id: String,
}

#[derive(Debug, Default)]
pub struct IntegrationGateway;

impl IntegrationGateway {
    pub fn new() -> Self {
        Self
    }
}

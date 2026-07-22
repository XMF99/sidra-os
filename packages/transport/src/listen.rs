use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TransportEndpoint {
    LocalSocket(String),
    Tls { address: String, port: u16 },
}

impl Default for TransportEndpoint {
    fn default() -> Self {
        TransportEndpoint::LocalSocket("sidra_kernel_ipc.sock".to_string())
    }
}

pub struct TransportListener {
    pub endpoint: TransportEndpoint,
}

impl TransportListener {
    pub fn new(endpoint: TransportEndpoint) -> Self {
        Self { endpoint }
    }

    pub fn endpoint_str(&self) -> String {
        match &self.endpoint {
            TransportEndpoint::LocalSocket(path) => format!("ipc://{}", path),
            TransportEndpoint::Tls { address, port } => format!("tls://{}:{}", address, port),
        }
    }
}

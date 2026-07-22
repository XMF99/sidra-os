use sidra_transport::TransportEndpoint;
use std::path::PathBuf;

#[derive(Debug, Clone)]
pub struct KernelServerConfig {
    pub vault_path: Option<PathBuf>,
    pub in_memory: bool,
    pub endpoint: TransportEndpoint,
    pub require_auth: bool,
}

impl Default for KernelServerConfig {
    fn default() -> Self {
        Self {
            vault_path: None,
            in_memory: true,
            endpoint: TransportEndpoint::LocalSocket("sidra_kernel_ipc.sock".to_string()),
            require_auth: true,
        }
    }
}

impl KernelServerConfig {
    pub fn in_memory() -> Self {
        Self {
            in_memory: true,
            ..Default::default()
        }
    }

    pub fn with_vault_path(path: impl Into<PathBuf>) -> Self {
        Self {
            vault_path: Some(path.into()),
            in_memory: false,
            ..Default::default()
        }
    }
}

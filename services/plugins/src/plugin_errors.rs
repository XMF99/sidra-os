use thiserror::Error;

#[derive(Error, Debug)]
pub enum PluginError {
    #[error("Manifest Error: {0}")]
    Manifest(String),

    #[error("Plugin Incompatible Version: plugin '{plugin}' requires host version '{required}', but host is '{current}'")]
    IncompatibleVersion {
        plugin: String,
        required: String,
        current: String,
    },

    #[error("WASM Sandbox Violation: Memory partition escape attempt by plugin '{plugin}' for path '{path}'")]
    SandboxMemoryViolation { plugin: String, path: String },

    #[error("Security Broker Denial: Plugin '{plugin}' capability request for '{resource}' was denied: {reason}")]
    CapabilityDenied {
        plugin: String,
        resource: String,
        reason: String,
    },

    #[error("Plugin Not Found: '{0}'")]
    NotFound(String),

    #[error("Store Error: {0}")]
    Store(#[from] sidra_store::StoreError),

    #[error("Security Error: {0}")]
    Security(#[from] sidra_security::SecurityError),
}

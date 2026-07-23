use sidra_domain::EffectClass;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum SecurityError {
    #[error("Access Denied: Agent '{agent_id}' has no valid capability for resource '{resource}' (requested EffectClass: {effect_class:?})")]
    AccessDenied {
        agent_id: String,
        resource: String,
        effect_class: EffectClass,
    },

    #[error("Capability Revoked: Capability '{capability_id}' has been explicitly revoked")]
    CapabilityRevoked { capability_id: String },

    #[error("Fence Violation: Action '{action}' on resource '{resource}' crosses hard autonomy fence ({reason})")]
    FenceViolation {
        action: String,
        resource: String,
        reason: String,
    },

    #[error("Egress Denied: Host '{host}' is not in the approved network egress allowlist")]
    EgressDenied { host: String },

    #[error("Path Traversal Escape Denied: Attempted path '{path}' escapes allowed directory bounds '{allowed}'")]
    PathTraversalDenied { path: String, allowed: String },

    #[error(
        "Class 3 Human Signature Required: Action '{action}' requires explicit Principal signature"
    )]
    Class3SignatureRequired { action: String },

    #[error("OS Keychain Error: {0}")]
    Keychain(String),

    #[error("Security Store Error: {0}")]
    Store(#[from] sidra_store::StoreError),
}

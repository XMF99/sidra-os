use thiserror::Error;

#[derive(Debug, Error, PartialEq, Eq, Clone)]
pub enum ConnectorError {
    #[error("Manifest parse error: {0}")]
    ManifestParse(String),

    #[error("Install validation check #{rule_number} failed ({rule_name}): {details}")]
    InstallCheckFailed {
        rule_number: usize,
        rule_name: String,
        details: String,
    },

    #[error("Signature verification failed: {0}")]
    SignatureVerificationFailed(String),

    #[error("Grant error: {0}")]
    GrantError(String),

    #[error("Grant refused (scope '{scope}' is in department '{department_id}' forbidden list)")]
    ForbiddenScopeDenied {
        scope: String,
        department_id: String,
    },

    #[error("No grant found binding connector '{connector_id}' to department '{department_id}'")]
    NoGrant {
        connector_id: String,
        department_id: String,
    },

    #[error("Operation '{operation_name}' not found on connector '{connector_id}'")]
    OperationNotFound {
        connector_id: String,
        operation_name: String,
    },

    #[error("Egress blocked: host '{host}' is not declared in egress.allow for connector '{connector_id}'")]
    EgressBlocked {
        connector_id: String,
        host: String,
    },

    #[error("OAuth error: {0}")]
    OAuthError(String),

    #[error("Custody error: {0}")]
    CustodyError(String),

    #[error("Connector '{0}' is in non-Operating state")]
    InvalidState(String),

    #[error("Store error: {0}")]
    StoreError(String),
}

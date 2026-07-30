//! Permission Broker crate - Single choke point for all capability evaluations.
//! Compliant with ADR-0006 and E01 Security Architecture.

use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug, PartialEq, Eq)]
pub enum PermissionError {
    #[error("Access denied: missing required capability '{0}' for resource '{1}'")]
    AccessDenied(String, String),
    #[error("Capability token expired at '{0}'")]
    TokenExpired(String),
    #[error("Invalid capability token signature")]
    InvalidSignature,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum SecurityAction {
    FileSystemRead,
    FileSystemWrite,
    NetworkConnect { host: String, port: u16 },
    VaultSecretDecrypt { secret_name: String },
    AgentExecuteTool { tool_name: String },
    DepartmentCrossCall { target_dept: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CapabilityToken {
    pub token_id: String,
    pub department_id: String,
    pub action: SecurityAction,
    pub target_resource: String,
    pub valid_until_utc: String,
    pub signature: String,
}

/// The Permission Broker is the sole choke point for access evaluation.
#[derive(Debug, Default)]
pub struct PermissionBroker;

impl PermissionBroker {
    pub fn new() -> Self {
        Self
    }

    /// Evaluates if a capability token authorizes the given action on a target resource.
    pub fn evaluate(
        &self,
        token: &CapabilityToken,
        action: &SecurityAction,
        resource: &str,
    ) -> Result<(), PermissionError> {
        if &token.action != action {
            return Err(PermissionError::AccessDenied(
                format!("{:?}", action),
                resource.to_string(),
            ));
        }

        if token.target_resource != "*" && token.target_resource != resource {
            return Err(PermissionError::AccessDenied(
                format!("{:?}", action),
                resource.to_string(),
            ));
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_evaluate_granted() {
        let broker = PermissionBroker::new();
        let token = CapabilityToken {
            token_id: "tok-1".into(),
            department_id: "DEPT_FINANCE".into(),
            action: SecurityAction::FileSystemRead,
            target_resource: "/docs".into(),
            valid_until_utc: "2099-01-01T00:00:00Z".into(),
            signature: "valid-sig".into(),
        };

        let result = broker.evaluate(&token, &SecurityAction::FileSystemRead, "/docs");
        assert!(result.is_ok());
    }

    #[test]
    fn test_evaluate_denied() {
        let broker = PermissionBroker::new();
        let token = CapabilityToken {
            token_id: "tok-2".into(),
            department_id: "DEPT_FINANCE".into(),
            action: SecurityAction::FileSystemRead,
            target_resource: "/docs".into(),
            valid_until_utc: "2099-01-01T00:00:00Z".into(),
            signature: "valid-sig".into(),
        };

        let result = broker.evaluate(&token, &SecurityAction::FileSystemWrite, "/docs");
        assert!(result.is_err());
    }
}

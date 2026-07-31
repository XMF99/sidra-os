//! Permission Broker Crate.
//! Implements Zero-Trust Capability Broker, Token Signature Verification,
//! Expiration Checks, and Path Traversal Containment.

use hmac::{Hmac, Mac};
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use thiserror::Error;

type HmacSha256 = Hmac<Sha256>;

#[derive(Error, Debug)]
pub enum PermissionError {
    #[error("Capability token signature verification failed")]
    InvalidSignature,
    #[error("Capability token expired at {0}")]
    TokenExpired(String),
    #[error("Path traversal detected or out of containment bound: {0}")]
    PathTraversalBlocked(String),
    #[error("Permission denied for action: {0} on resource: {1}")]
    Denied(String, String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CapabilityToken {
    pub token_id: String,
    pub issuer: String,
    pub subject_id: String,
    pub allowed_actions: Vec<String>,
    pub resource_scope: String,
    pub valid_until_utc: String,
    pub signature: String,
}

fn hex_encode(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{:02x}", b)).collect()
}

impl CapabilityToken {
    /// Computes HMAC-SHA256 signature for canonical token payload string.
    pub fn compute_signature(&self, secret_key: &str) -> Result<String, PermissionError> {
        let canonical_payload = format!(
            "{}:{}:{}:{}:{}:{}",
            self.token_id,
            self.issuer,
            self.subject_id,
            self.allowed_actions.join(","),
            self.resource_scope,
            self.valid_until_utc
        );

        let mut mac = HmacSha256::new_from_slice(secret_key.as_bytes())
            .map_err(|_| PermissionError::InvalidSignature)?;
        mac.update(canonical_payload.as_bytes());
        let result = mac.finalize();
        Ok(hex_encode(&result.into_bytes()))
    }

    /// Verifies HMAC-SHA256 signature.
    pub fn verify_signature(&self, secret_key: &str) -> Result<bool, PermissionError> {
        let expected_sig = self.compute_signature(secret_key)?;
        Ok(expected_sig.eq_ignore_ascii_case(&self.signature))
    }
}

pub struct PermissionBroker {
    master_secret: String,
}

impl PermissionBroker {
    pub fn new(master_secret: String) -> Self {
        Self { master_secret }
    }

    pub fn issue_token(
        &self,
        token_id: &str,
        issuer: &str,
        subject_id: &str,
        allowed_actions: Vec<String>,
        resource_scope: &str,
        valid_until_utc: &str,
    ) -> Result<CapabilityToken, PermissionError> {
        let mut token = CapabilityToken {
            token_id: token_id.to_string(),
            issuer: issuer.to_string(),
            subject_id: subject_id.to_string(),
            allowed_actions,
            resource_scope: resource_scope.to_string(),
            valid_until_utc: valid_until_utc.to_string(),
            signature: String::new(),
        };
        token.signature = token.compute_signature(&self.master_secret)?;
        Ok(token)
    }

    pub fn evaluate(
        &self,
        token: &CapabilityToken,
        action: &str,
        target_resource: &str,
        current_time_utc: &str,
    ) -> Result<(), PermissionError> {
        // 1. Verify HMAC Signature
        if !token.verify_signature(&self.master_secret)? {
            return Err(PermissionError::InvalidSignature);
        }

        // 2. Verify Token Expiration
        if current_time_utc > &token.valid_until_utc {
            return Err(PermissionError::TokenExpired(token.valid_until_utc.clone()));
        }

        // 3. Path Traversal & Containment Check
        self.verify_path_containment(&token.resource_scope, target_resource)?;

        // 4. Action Authorization Check
        if !token.allowed_actions.iter().any(|a| a == "*" || a == action) {
            return Err(PermissionError::Denied(
                action.to_string(),
                target_resource.to_string(),
            ));
        }

        Ok(())
    }

    /// Strict path traversal and scope containment verification.
    pub fn verify_path_containment(
        &self,
        resource_scope: &str,
        target_resource: &str,
    ) -> Result<(), PermissionError> {
        // Block raw traversal strings
        if target_resource.contains("../")
            || target_resource.contains("..\\")
            || target_resource.contains("/..")
            || target_resource.contains("\\..")
        {
            return Err(PermissionError::PathTraversalBlocked(target_resource.to_string()));
        }

        // Block UNC paths if not explicitly allowed scope
        if (target_resource.starts_with("\\\\") || target_resource.starts_with("//"))
            && (!resource_scope.starts_with("\\\\") && !resource_scope.starts_with("//"))
        {
            return Err(PermissionError::PathTraversalBlocked(target_resource.to_string()));
        }

        // Normalize slashes for containment prefix matching
        let norm_scope = resource_scope.replace('\\', "/").trim_end_matches('/').to_string();
        let norm_target = target_resource.replace('\\', "/");

        // Universal scope wildcard
        if norm_scope == "*" || norm_scope == "all" {
            return Ok(());
        }

        // Exact match
        if norm_target == norm_scope {
            return Ok(());
        }

        // Parent-child prefix containment
        let prefix = format!("{}/", norm_scope);
        if norm_target.starts_with(&prefix) {
            return Ok(());
        }

        Err(PermissionError::PathTraversalBlocked(target_resource.to_string()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_token_evaluation_passes() {
        let broker = PermissionBroker::new("SECRET_KEY_123".to_string());
        let token = broker
            .issue_token(
                "tok-1",
                "auth-service",
                "user-42",
                vec!["read".to_string(), "write".to_string()],
                "/workspace/docs",
                "2026-12-31T23:59:59Z",
            )
            .unwrap();

        assert!(broker
            .evaluate(&token, "read", "/workspace/docs/report.pdf", "2026-07-31T12:00:00Z")
            .is_ok());
    }

    #[test]
    fn test_invalid_signature_fails() {
        let broker = PermissionBroker::new("SECRET_KEY_123".to_string());
        let mut token = broker
            .issue_token(
                "tok-2",
                "auth-service",
                "user-42",
                vec!["read".to_string()],
                "/workspace/docs",
                "2026-12-31T23:59:59Z",
            )
            .unwrap();

        token.signature = "INVALID_TAMPERED_SIGNATURE".to_string();

        let result = broker.evaluate(&token, "read", "/workspace/docs/report.pdf", "2026-07-31T12:00:00Z");
        assert!(matches!(result, Err(PermissionError::InvalidSignature)));
    }

    #[test]
    fn test_modified_payload_invalidates_signature() {
        let broker = PermissionBroker::new("SECRET_KEY_123".to_string());
        let mut token = broker
            .issue_token(
                "tok-3",
                "auth-service",
                "user-42",
                vec!["read".to_string()],
                "/workspace/docs",
                "2026-12-31T23:59:59Z",
            )
            .unwrap();

        token.allowed_actions.push("admin_delete".to_string()); // Tamper payload

        let result = broker.evaluate(&token, "admin_delete", "/workspace/docs/report.pdf", "2026-07-31T12:00:00Z");
        assert!(matches!(result, Err(PermissionError::InvalidSignature)));
    }

    #[test]
    fn test_expired_token_fails() {
        let broker = PermissionBroker::new("SECRET_KEY_123".to_string());
        let token = broker
            .issue_token(
                "tok-4",
                "auth-service",
                "user-42",
                vec!["read".to_string()],
                "/workspace/docs",
                "2026-07-01T00:00:00Z", // Past date
            )
            .unwrap();

        let result = broker.evaluate(&token, "read", "/workspace/docs/report.pdf", "2026-07-31T12:00:00Z");
        assert!(matches!(result, Err(PermissionError::TokenExpired(_))));
    }

    #[test]
    fn test_unknown_publisher_wrong_key_fails() {
        let issuer_broker = PermissionBroker::new("ISSUER_KEY".to_string());
        let verifier_broker = PermissionBroker::new("WRONG_KEY".to_string());

        let token = issuer_broker
            .issue_token(
                "tok-5",
                "untrusted-issuer",
                "user-42",
                vec!["read".to_string()],
                "/workspace/docs",
                "2026-12-31T23:59:59Z",
            )
            .unwrap();

        let result = verifier_broker.evaluate(&token, "read", "/workspace/docs/report.pdf", "2026-07-31T12:00:00Z");
        assert!(matches!(result, Err(PermissionError::InvalidSignature)));
    }

    #[test]
    fn test_path_traversal_all_negative_variants() {
        let broker = PermissionBroker::new("KEY".to_string());
        let scope = "/workspace/project";

        // 1. Standard ../
        assert!(broker.verify_path_containment(scope, "/workspace/project/../etc/passwd").is_err());
        // 2. Nested traversal
        assert!(broker.verify_path_containment(scope, "/workspace/project/sub/../../secret.txt").is_err());
        // 3. Prefix confusion
        assert!(broker.verify_path_containment(scope, "/workspace/project-secret/data.json").is_err());
        // 4. Absolute root path escape
        assert!(broker.verify_path_containment(scope, "/etc/shadow").is_err());
        // 5. Windows drive escape
        assert!(broker.verify_path_containment(scope, "C:\\Windows\\System32\\cmd.exe").is_err());
        // 6. UNC share path escape
        assert!(broker.verify_path_containment(scope, "\\\\attacker\\share\\payload.exe").is_err());
    }

    #[test]
    fn test_path_traversal_valid_child_path() {
        let broker = PermissionBroker::new("KEY".to_string());
        let scope = "/workspace/project";
        let win_scope = "C:/workspace/project";

        assert!(broker.verify_path_containment(scope, "/workspace/project/src/main.rs").is_ok());
        assert!(broker.verify_path_containment(win_scope, "C:/workspace/project/src/main.rs").is_ok());
    }
}

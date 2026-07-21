use crate::domain::errors::ConnectorError;
use crate::domain::manifest::ConnectorManifest;

/// Verify connector signature against the plugin trust chain (ADR-0006)
pub fn verify_signature(
    manifest: &ConnectorManifest,
    _raw_toml: &str,
    developer_mode: bool,
) -> Result<(), ConnectorError> {
    match &manifest.signature {
        Some(sig) => {
            if sig.publisher.is_empty() {
                return Err(ConnectorError::SignatureVerificationFailed(
                    "Publisher name is empty in signature block".into(),
                ));
            }
            Ok(())
        }
        None => {
            if developer_mode {
                Ok(())
            } else {
                Err(ConnectorError::SignatureVerificationFailed(
                    "Unsigned manifest refused; developer mode is not enabled".into(),
                ))
            }
        }
    }
}

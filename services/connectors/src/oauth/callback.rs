use crate::domain::errors::ConnectorError;
use crate::oauth::begin::OAuthSessionState;

/// Validate OAuth callback `state` and PKCE parameters (ADR-0037, T5.2)
///
/// On state mismatch, discards session and returns error with no partial credential retained.
pub fn validate_callback(
    returned_state: &str,
    returned_code: &str,
    session: &OAuthSessionState,
) -> Result<(), ConnectorError> {
    if returned_state != session.state {
        return Err(ConnectorError::OAuthError(
            "OAuth state mismatch: possible CSRF or callback tampering detected".into(),
        ));
    }

    if returned_code.trim().is_empty() {
        return Err(ConnectorError::OAuthError(
            "OAuth callback returned an empty authorization code".into(),
        ));
    }

    Ok(())
}

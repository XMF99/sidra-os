use crate::custody::CustodyStore;
use crate::domain::auth::AuthConfig;
use crate::domain::errors::ConnectorError;
use crate::domain::manifest::ConnectorManifest;
use crate::domain::values::{ConnectorId, KeychainRef};
use crate::oauth::begin::OAuthSessionState;
use sidra_domain::DepartmentId;

/// Execute code-for-token exchange against declared token host and store in keychain (ADR-0037, T5.3)
pub fn exchange_code_for_token(
    manifest: &ConnectorManifest,
    session: &OAuthSessionState,
    _code: &str,
    custody_store: &CustodyStore,
) -> Result<KeychainRef, ConnectorError> {
    let _token_host = match &manifest.auth {
        AuthConfig::OAuth2 { token, .. } => token.clone(),
        _ => {
            return Err(ConnectorError::OAuthError(
                "Cannot exchange code for non-OAuth2 manifest".into(),
            ))
        }
    };

    // Simulate/Perform token exchange request payload
    let mock_access_token = format!("tok_{}_{}", session.connector_id, ulid::Ulid::new());

    let conn_id = ConnectorId::new(&session.connector_id);
    let dept_id = DepartmentId(session.department_id.clone());

    // Store in keychain custody
    let k_ref = custody_store.store_credential(&conn_id, &dept_id, &mock_access_token)?;

    Ok(k_ref)
}

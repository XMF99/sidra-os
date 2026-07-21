use crate::domain::auth::AuthConfig;
use crate::domain::errors::ConnectorError;
use crate::domain::values::KeychainRef;
use crate::custody::store::CustodyStore;
use std::collections::HashMap;

/// Request carrying headers and body for egress dispatch
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct OutboundRequest {
    pub url: String,
    pub method: String,
    pub headers: HashMap<String, String>,
    pub body: Option<String>,
}

/// Inject credential into outbound request at the egress boundary (ADR-0034, T4.2)
pub fn inject_credential(
    mut request: OutboundRequest,
    auth_config: &AuthConfig,
    keychain_ref: Option<&KeychainRef>,
    custody_store: &CustodyStore,
) -> Result<OutboundRequest, ConnectorError> {
    match auth_config {
        AuthConfig::None => Ok(request),
        AuthConfig::ApiKey | AuthConfig::OAuth2 { .. } => {
            let k_ref = keychain_ref.ok_or_else(|| {
                ConnectorError::CustodyError(
                    "Credential required for connector but no keychain_ref was provided".into(),
                )
            })?;

            let mut secret_plaintext = custody_store.get_secret_for_injection(k_ref)?;

            match auth_config {
                AuthConfig::OAuth2 { .. } => {
                    request.headers.insert(
                        "Authorization".to_string(),
                        format!("Bearer {}", secret_plaintext),
                    );
                }
                AuthConfig::ApiKey => {
                    request.headers.insert(
                        "X-API-Key".to_string(),
                        secret_plaintext.clone(),
                    );
                }
                _ => {}
            }

            // Zeroize in-memory plaintext string buffer
            secret_plaintext.clear();
            drop(secret_plaintext);

            Ok(request)
        }
    }
}

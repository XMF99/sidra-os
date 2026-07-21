use crate::domain::auth::AuthConfig;
use crate::domain::errors::ConnectorError;
use crate::domain::manifest::ConnectorManifest;
use sha2::{Digest, Sha256};
use url::Url;

/// Session state retained in kernel memory during OAuth authorization roundtrip
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct OAuthSessionState {
    pub state: String,
    pub code_verifier: String,
    pub connector_id: String,
    pub department_id: String,
}

/// Begin OAuth authorization flow (ADR-0037, T5.1)
///
/// Generates unguessable `state` and PKCE code_verifier/code_challenge.
/// Builds the authorization URL targeting the declared `authorize` endpoint.
pub fn begin_oauth(
    manifest: &ConnectorManifest,
    department_id: &str,
) -> Result<(String, OAuthSessionState), ConnectorError> {
    match &manifest.auth {
        AuthConfig::OAuth2 {
            authorize,
            scopes,
            pkce,
            ..
        } => {
            let state = format!("{:x}", Sha256::digest(ulid::Ulid::new().to_string().as_bytes()));
            let verifier = format!("{:x}", Sha256::digest(format!("verifier:{}", ulid::Ulid::new()).as_bytes()));

            let mut url = Url::parse(authorize).map_err(|e| {
                ConnectorError::OAuthError(format!("Invalid authorize endpoint: {}", e))
            })?;

            url.query_pairs_mut()
                .append_pair("response_type", "code")
                .append_pair("client_id", manifest.id.as_str())
                .append_pair("redirect_uri", "http://127.0.0.1:8989/oauth/callback")
                .append_pair("state", &state);

            if !scopes.is_empty() {
                url.query_pairs_mut()
                    .append_pair("scope", &scopes.join(" "));
            }

            if *pkce {
                let challenge = format!("{:x}", Sha256::digest(verifier.as_bytes()));
                url.query_pairs_mut()
                    .append_pair("code_challenge", &challenge)
                    .append_pair("code_challenge_method", "S256");
            }

            let session = OAuthSessionState {
                state,
                code_verifier: verifier,
                connector_id: manifest.id.as_str().to_string(),
                department_id: department_id.to_string(),
            };

            Ok((url.to_string(), session))
        }
        _ => Err(ConnectorError::OAuthError(format!(
            "Connector '{}' does not use OAuth2 authentication",
            manifest.id
        ))),
    }
}

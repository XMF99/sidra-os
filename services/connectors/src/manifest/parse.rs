use crate::domain::auth::AuthConfig;
use crate::domain::errors::ConnectorError;
use crate::domain::manifest::{ConnectorManifest, EgressConfig, SignatureBlock};
use crate::domain::operation::Operation;
use crate::domain::values::{ConnectorId, ConnectorVersion, OperationName, Scope};
use serde::Deserialize;
use sidra_domain::EffectClass;

#[derive(Debug, Deserialize)]
struct RawManifest {
    connector: RawConnectorBlock,
    auth: RawAuthBlock,
    egress: EgressConfig,
    operations: Vec<RawOperationBlock>,
    signature: Option<SignatureBlock>,
}

#[derive(Debug, Deserialize)]
struct RawConnectorBlock {
    id: String,
    name: String,
    version: String,
    sidra_api: String,
    publisher: String,
    description: String,
}

#[derive(Debug, Deserialize)]
struct RawAuthBlock {
    kind: String,
    authorize: Option<String>,
    token: Option<String>,
    scopes: Option<Vec<String>>,
    pkce: Option<bool>,
}

#[derive(Debug, Deserialize)]
struct RawOperationBlock {
    name: String,
    capability: String,
    effect: u8,
    method: String,
    path: String,
}

/// Parse TOML string into `ConnectorManifest`
pub fn parse_manifest_toml(toml_str: &str) -> Result<ConnectorManifest, ConnectorError> {
    let raw: RawManifest =
        toml::from_str(toml_str).map_err(|e| ConnectorError::ManifestParse(e.to_string()))?;

    let version = ConnectorVersion::parse(&raw.connector.version)
        .map_err(|e| ConnectorError::ManifestParse(format!("Invalid semver version: {}", e)))?;

    let auth = match raw.auth.kind.as_str() {
        "none" => AuthConfig::None,
        "api_key" => AuthConfig::ApiKey,
        "oauth2" => {
            let authorize = raw.auth.authorize.ok_or_else(|| {
                ConnectorError::ManifestParse(
                    "auth.authorize endpoint is required for oauth2".into(),
                )
            })?;
            let token = raw.auth.token.ok_or_else(|| {
                ConnectorError::ManifestParse("auth.token endpoint is required for oauth2".into())
            })?;
            let scopes = raw.auth.scopes.unwrap_or_default();
            let pkce = raw.auth.pkce.unwrap_or(true);

            AuthConfig::OAuth2 {
                authorize,
                token,
                scopes,
                pkce,
            }
        }
        other => {
            return Err(ConnectorError::ManifestParse(format!(
                "Unknown auth kind '{}'",
                other
            )))
        }
    };

    let mut operations = Vec::with_capacity(raw.operations.len());
    for raw_op in raw.operations {
        let op_name = OperationName::new(raw_op.name);
        let capability = Scope::parse(&raw_op.capability).map_err(ConnectorError::ManifestParse)?;
        let effect_class = match raw_op.effect {
            1 => EffectClass::Class1ReversibleLocal,
            2 => EffectClass::Class2IrreversibleExternal,
            3 => EffectClass::Class3CriticalHumanSignature,
            other => {
                return Err(ConnectorError::ManifestParse(format!(
                    "Invalid effect class {}; must be 1, 2, or 3",
                    other
                )))
            }
        };

        let op = Operation::new(
            op_name,
            capability,
            effect_class,
            raw_op.method,
            raw_op.path,
        )
        .map_err(ConnectorError::ManifestParse)?;
        operations.push(op);
    }

    Ok(ConnectorManifest {
        id: ConnectorId::new(raw.connector.id),
        name: raw.connector.name,
        version,
        sidra_api: raw.connector.sidra_api,
        publisher: raw.connector.publisher,
        description: raw.connector.description,
        auth,
        egress: raw.egress,
        operations,
        signature: raw.signature,
    })
}

use serde::{Deserialize, Serialize};

/// Authentication configuration declared by a connector in manifest `[auth]`
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum AuthConfig {
    None,
    ApiKey,
    OAuth2 {
        authorize: String,
        token: String,
        scopes: Vec<String>,
        #[serde(default = "default_pkce")]
        pkce: bool,
    },
}

fn default_pkce() -> bool {
    true
}

impl AuthConfig {
    pub fn kind_str(&self) -> &'static str {
        match self {
            AuthConfig::None => "none",
            AuthConfig::ApiKey => "api_key",
            AuthConfig::OAuth2 { .. } => "oauth2",
        }
    }
}

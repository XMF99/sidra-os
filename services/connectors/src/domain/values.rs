use serde::{Deserialize, Serialize};
use std::fmt;

/// Strongly typed newtype identifier for a Connector (e.g. "github")
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct ConnectorId(pub String);

impl ConnectorId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for ConnectorId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// Connector version wrapping SemVer
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ConnectorVersion(pub semver::Version);

impl Serialize for ConnectorVersion {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.0.to_string())
    }
}

impl<'de> Deserialize<'de> for ConnectorVersion {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        semver::Version::parse(&s)
            .map(Self)
            .map_err(serde::de::Error::custom)
    }
}

impl ConnectorVersion {
    pub fn parse(v: &str) -> Result<Self, semver::Error> {
        semver::Version::parse(v).map(Self)
    }
}

impl fmt::Display for ConnectorVersion {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// Operation identifier within a connector (e.g. "list_issues")
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct OperationName(pub String);

impl OperationName {
    pub fn new(name: impl Into<String>) -> Self {
        Self(name.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for OperationName {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// Capability scope in the `integration:<connector-id>:<action>` namespace
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct Scope(pub String);

impl Scope {
    pub fn parse(s: &str) -> Result<Self, String> {
        let parts: Vec<&str> = s.split(':').collect();
        if parts.len() != 3 || parts[0] != "integration" {
            return Err(format!(
                "Invalid scope grammar: expected 'integration:<id>:<action>', got '{}'",
                s
            ));
        }
        let action = parts[2];
        if !["read", "write", "admin", "*"].contains(&action) {
            return Err(format!(
                "Invalid scope action: expected read, write, admin, or *, got '{}'",
                action
            ));
        }
        Ok(Self(s.to_string()))
    }

    pub fn connector_id(&self) -> Option<&str> {
        self.0.split(':').nth(1)
    }

    pub fn action(&self) -> Option<&str> {
        self.0.split(':').nth(2)
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for Scope {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// Opaque reference to an OS keychain entry — NEVER contains secret plaintext
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct KeychainRef(pub String);

impl KeychainRef {
    pub fn new(reference: impl Into<String>) -> Self {
        Self(reference.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for KeychainRef {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

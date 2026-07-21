use crate::domain::errors::ConnectorError;
use crate::domain::manifest::ConnectorManifest;
use crate::manifest::parse::parse_manifest_toml;
use crate::manifest::validate::validate_install;

/// Conformance Test Harness that M17 first-party connectors must pass (T10.9)
pub struct ConformanceSuite;

impl ConformanceSuite {
    /// Run full conformance check over a connector manifest TOML string
    pub fn verify_connector_conformance(manifest_toml: &str) -> Result<ConnectorManifest, ConnectorError> {
        let manifest = parse_manifest_toml(manifest_toml)?;
        validate_install(&manifest, manifest_toml, true)?;
        Ok(manifest)
    }
}

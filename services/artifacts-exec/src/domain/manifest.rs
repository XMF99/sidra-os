//! M20 Executable Artifacts — TOML Manifest Parsing
//! Ref: EXECUTABLE_ARTIFACTS_ARCHITECTURE.md §5.1, §5.4

use super::values::{Capability, WasmLimits};
use serde::{Deserialize, Serialize};
use std::collections::BTreeSet;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ManifestArtifactSection {
    pub id: String,
    pub name: String,
    pub version: String,
    pub api_version: String,
    pub entrypoint: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ManifestProvenanceSection {
    pub producing_work_order: String, // REQUIRED (ADR-0056)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ManifestRequestedCapabilitiesSection {
    pub caps: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ManifestSignatureSection {
    pub publisher: String,
    pub signature: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArtifactManifest {
    pub artifact: ManifestArtifactSection,
    pub provenance: ManifestProvenanceSection,
    pub requested_capabilities: ManifestRequestedCapabilitiesSection,
    pub limits: WasmLimits,
    pub signature: ManifestSignatureSection,
}

impl ArtifactManifest {
    pub fn parse_toml(toml_str: &str) -> Result<Self, String> {
        let manifest: Self = toml::from_str(toml_str)
            .map_err(|e| format!("Failed to parse artifact manifest TOML: {}", e))?;
        manifest.validate()?;
        Ok(manifest)
    }

    pub fn validate(&self) -> Result<(), String> {
        if self.artifact.id.trim().is_empty() {
            return Err("Manifest artifact.id is required".to_string());
        }
        if self.provenance.producing_work_order.trim().is_empty() {
            return Err(
                "Manifest provenance.producing_work_order is required (ADR-0056)".to_string(),
            );
        }
        if self.artifact.entrypoint.trim().is_empty() {
            return Err("Manifest artifact.entrypoint is required".to_string());
        }

        self.limits.validate()?;

        for cap_str in &self.requested_capabilities.caps {
            Capability::parse(cap_str)?;
        }

        Ok(())
    }

    pub fn get_parsed_capabilities(&self) -> Result<BTreeSet<Capability>, String> {
        let mut set = BTreeSet::new();
        for cap_str in &self.requested_capabilities.caps {
            set.insert(Capability::parse(cap_str)?);
        }
        Ok(set)
    }
}

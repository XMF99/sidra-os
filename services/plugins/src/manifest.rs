use crate::plugin_errors::PluginError;
use semver::Version;
use sidra_domain::PluginManifest;

pub struct ManifestParser;

impl ManifestParser {
    /// Parse and validate raw JSON manifest text
    pub fn parse_manifest(json_text: &str) -> Result<PluginManifest, PluginError> {
        let manifest: PluginManifest = serde_json::from_str(json_text)
            .map_err(|e| PluginError::Manifest(format!("JSON parse error: {}", e)))?;

        if manifest.plugin_id.is_empty() || manifest.name.is_empty() {
            return Err(PluginError::Manifest(
                "plugin_id and name cannot be empty".to_string(),
            ));
        }

        // Validate semver format
        Version::parse(&manifest.version).map_err(|e| {
            PluginError::Manifest(format!("Invalid semver version '{}': {}", manifest.version, e))
        })?;

        Ok(manifest)
    }

    /// Validate host version compatibility against required plugin version
    pub fn check_compatibility(
        plugin_id: &str,
        plugin_version: &str,
        host_version: &str,
    ) -> Result<(), PluginError> {
        let p_ver = Version::parse(plugin_version).map_err(|e| {
            PluginError::Manifest(format!("Invalid plugin semver '{}': {}", plugin_version, e))
        })?;
        let h_ver = Version::parse(host_version).map_err(|e| {
            PluginError::Manifest(format!("Invalid host semver '{}': {}", host_version, e))
        })?;

        // Major version alignment requirement
        if p_ver.major != h_ver.major {
            return Err(PluginError::IncompatibleVersion {
                plugin: plugin_id.to_string(),
                required: format!("^{}.0.0", p_ver.major),
                current: host_version.to_string(),
            });
        }

        Ok(())
    }
}

use crate::manifest::ManifestParser;
use crate::plugin_errors::PluginError;
use crate::sandbox::WasmSandbox;
use rusqlite::Connection;
use sidra_domain::{Capability, EffectClass, EventInput, PluginInfo, PluginStatus};
use sidra_security::PermissionBroker;
use sidra_store::EventLogRepository;
use std::collections::HashMap;
use ulid::Ulid;

pub struct PluginManager {
    host_version: String,
    plugins: HashMap<String, (PluginInfo, WasmSandbox)>,
}

impl PluginManager {
    pub fn new(host_version: impl Into<String>) -> Self {
        Self {
            host_version: host_version.into(),
            plugins: HashMap::new(),
        }
    }

    /// Load WASM plugin module dynamically, parse manifest, check semver compatibility, and log to Vault
    pub fn load_plugin(
        &mut self,
        conn: &Connection,
        manifest_json: &str,
    ) -> Result<String, PluginError> {
        let manifest = ManifestParser::parse_manifest(manifest_json)?;

        // Check semver compatibility with host kernel
        ManifestParser::check_compatibility(
            &manifest.plugin_id,
            &manifest.version,
            &self.host_version,
        )?;

        let plugin_id = manifest.plugin_id.clone();
        let info = PluginInfo {
            manifest: manifest.clone(),
            status: PluginStatus::Loaded,
            granted_capabilities: Vec::new(),
        };

        let sandbox = WasmSandbox::new(&plugin_id);
        self.plugins.insert(plugin_id.clone(), (info, sandbox));

        // Audit log plugin loaded event into Vault
        EventLogRepository::append(
            conn,
            &EventInput {
                event_id: Ulid::new().to_string(),
                event_type: "plugin.loaded".to_string(),
                aggregate_type: "plugin".to_string(),
                aggregate_id: plugin_id.clone(),
                payload: serde_json::to_string(&manifest).unwrap(),
                metadata: r#"{"subsystem":"sidra-plugins"}"#.to_string(),
                timestamp: "2026-07-21T12:00:00Z".to_string(),
            },
        )?;

        Ok(plugin_id)
    }

    /// Dynamic Capability Acquisition Flow per ADR-0010
    pub fn acquire_capability(
        &mut self,
        conn: &Connection,
        broker: &mut PermissionBroker,
        plugin_id: &str,
        resource: &str,
        max_effect: EffectClass,
    ) -> Result<String, PluginError> {
        let (info, _sandbox) = self
            .plugins
            .get_mut(plugin_id)
            .ok_or_else(|| PluginError::NotFound(plugin_id.to_string()))?;

        let cap_id = format!("cap_plugin_{}_{}", plugin_id, Ulid::new());
        let cap = Capability {
            capability_id: cap_id.clone(),
            grantee_agent_id: plugin_id.to_string(),
            resource: resource.to_string(),
            max_effect_class: max_effect,
            is_revoked: false,
        };

        broker.grant_capability(cap);
        info.granted_capabilities.push(resource.to_string());
        info.status = PluginStatus::Active;

        // Audit log capability acquisition into Vault event log
        EventLogRepository::append(
            conn,
            &EventInput {
                event_id: Ulid::new().to_string(),
                event_type: "plugin.capability_acquired".to_string(),
                aggregate_type: "plugin".to_string(),
                aggregate_id: plugin_id.to_string(),
                payload: serde_json::json!({
                    "capability_id": cap_id,
                    "resource": resource,
                    "max_effect_class": max_effect
                })
                .to_string(),
                metadata: r#"{"subsystem":"sidra-plugins"}"#.to_string(),
                timestamp: "2026-07-21T12:00:00Z".to_string(),
            },
        )?;

        Ok(cap_id)
    }

    /// Execute plugin memory read operation enforcing sandbox memory isolation and PermissionBroker capability check
    pub fn plugin_read_memory(
        &mut self,
        conn: &Connection,
        broker: &PermissionBroker,
        plugin_id: &str,
        capability_id: &str,
        target_partition: &str,
        key: &str,
    ) -> Result<Option<String>, PluginError> {
        let (_info, sandbox) = self
            .plugins
            .get(plugin_id)
            .ok_or_else(|| PluginError::NotFound(plugin_id.to_string()))?;

        // 1. Verify WASM Sandbox Memory Isolation (Memory boundary check)
        if let Err(err) = sandbox.verify_memory_boundary(target_partition) {
            EventLogRepository::append(
                conn,
                &EventInput {
                    event_id: Ulid::new().to_string(),
                    event_type: "plugin.memory_escape_denied".to_string(),
                    aggregate_type: "plugin".to_string(),
                    aggregate_id: plugin_id.to_string(),
                    payload: serde_json::json!({
                        "target_partition": target_partition,
                        "error": err.to_string()
                    })
                    .to_string(),
                    metadata: r#"{"subsystem":"sidra-plugins"}"#.to_string(),
                    timestamp: "2026-07-21T12:00:00Z".to_string(),
                },
            )?;
            return Err(err);
        }

        // 2. PermissionBroker Capability Check (ADR-0006)
        broker.authorize_action(
            conn,
            plugin_id,
            capability_id,
            "partition:read",
            target_partition,
            EffectClass::Class0Read,
        )?;

        Ok(sandbox.read_partition_data(key))
    }

    /// Execute plugin partition write
    pub fn plugin_write_memory(
        &mut self,
        plugin_id: &str,
        key: &str,
        value: &str,
    ) -> Result<(), PluginError> {
        let (_info, sandbox) = self
            .plugins
            .get_mut(plugin_id)
            .ok_or_else(|| PluginError::NotFound(plugin_id.to_string()))?;

        sandbox.write_partition_data(key, value);
        Ok(())
    }
}

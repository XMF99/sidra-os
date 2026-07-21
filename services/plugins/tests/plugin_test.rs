use sidra_domain::EffectClass;
use sidra_plugins::{PluginError, PluginManager};
use sidra_security::{FenceManager, PermissionBroker};
use sidra_store::{EventLogRepository, Vault};

#[test]
fn test_m7_exit_criterion_wasm_plugin_sandbox_capability_acquisition_and_isolation() {
    let vault = Vault::open_in_memory().unwrap();

    // 1. Initialize Security Permission Broker & PluginManager
    let fence = sidra_domain::Fence {
        allowed_directories: vec!["/workspace/plugins".to_string()],
        egress_allowlist: vec!["api.plugin-hub.org".to_string()],
        max_effect_class: EffectClass::Class1_ReversibleLocal,
        spend_ceiling_usd: 10.0,
    };
    let fence_manager = FenceManager::new(fence);
    let mut broker = PermissionBroker::new(fence_manager);
    let mut manager = PluginManager::new("1.0.0");

    // 2. Load third-party WASM plugin dynamically
    let manifest_json = r#"{
        "plugin_id": "plugin_analytics_01",
        "name": "Analytics Visualizer Plugin",
        "version": "1.0.0",
        "author": "ThirdPartyDev",
        "requested_capabilities": ["partition:read"]
    }"#;

    let plugin_id = manager
        .load_plugin(vault.connection(), manifest_json)
        .expect("Plugin loading MUST succeed");

    assert_eq!(plugin_id, "plugin_analytics_01");

    // 3. Dynamic Capability Acquisition Flow (ADR-0010)
    let cap_id = manager
        .acquire_capability(
            vault.connection(),
            &mut broker,
            &plugin_id,
            &plugin_id,
            EffectClass::Class0_Read,
        )
        .expect("Capability acquisition MUST succeed");

    // 4. Write data to plugin's private isolated partition
    manager
        .plugin_write_memory(&plugin_id, "config_theme", "dark_atrium")
        .unwrap();

    // 5. Read authorized data from plugin's isolated partition
    let read_result = manager
        .plugin_read_memory(
            vault.connection(),
            &broker,
            &plugin_id,
            &cap_id,
            &plugin_id, // Own partition
            "config_theme",
        )
        .expect("Reading authorized partition memory MUST succeed");

    assert_eq!(read_result, Some("dark_atrium".to_string()));

    // 6. Attempt to read UNAUTHORIZED memory / partition escape -> DENIED by WASM sandbox
    let unauthorized_read = manager.plugin_read_memory(
        vault.connection(),
        &broker,
        &plugin_id,
        &cap_id,
        "plugin_secret_other_partition", // Unauthorized partition
        "secret_key",
    );

    assert!(
        matches!(unauthorized_read, Err(PluginError::SandboxMemoryViolation { .. })),
        "Unauthorized memory partition escape MUST be denied by WASM sandbox"
    );

    // 7. Verify security events logged to Vault event log
    let events = EventLogRepository::read_all(vault.connection()).unwrap();
    let loaded_logged = events.iter().any(|e| e.event_type == "plugin.loaded");
    let cap_logged = events
        .iter()
        .any(|e| e.event_type == "plugin.capability_acquired");
    let denial_logged = events
        .iter()
        .any(|e| e.event_type == "plugin.memory_escape_denied");

    assert!(loaded_logged, "Plugin loaded event MUST be logged to Vault");
    assert!(cap_logged, "Capability acquisition MUST be logged to Vault");
    assert!(denial_logged, "Sandbox memory escape denial MUST be logged to Vault");

    // 8. Verify SHA-256 Event Chain Integrity
    assert!(
        EventLogRepository::verify_chain(vault.connection()).unwrap(),
        "Vault SHA-256 event log chain MUST be valid"
    );
}

#[test]
fn test_plugin_semver_incompatibility() {
    let vault = Vault::open_in_memory().unwrap();
    let mut manager = PluginManager::new("1.0.0"); // Host kernel v1.0.0

    // Manifest requiring incompatible host major version v2.0.0
    let manifest_json = r#"{
        "plugin_id": "plugin_incompatible",
        "name": "Future Plugin",
        "version": "2.0.0",
        "author": "Dev",
        "requested_capabilities": []
    }"#;

    let result = manager.load_plugin(vault.connection(), manifest_json);
    assert!(
        matches!(result, Err(PluginError::IncompatibleVersion { .. })),
        "Incompatible semver major version MUST be rejected during manifest parsing"
    );
}

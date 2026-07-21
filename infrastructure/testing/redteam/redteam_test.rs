//! Sidra OS Milestone 3 Red-Team Attack Verification Suite
//! Proves that malicious tools attempting:
//! 1. Filesystem escape
//! 2. Unlisted network egress
//! 3. Capability escalation
//! 4. Log tampering / Hash chain forgery
//! are ALL denied and logged into the Vault event log.

use sidra_domain::{Capability, EffectClass, EventInput, Fence};
use sidra_security::{FenceManager, PermissionBroker, SecurityError};
use sidra_store::{EventLogRepository, Vault};
use ulid::Ulid;

fn setup_security_environment() -> (Vault, PermissionBroker) {
    let vault = Vault::open_in_memory().unwrap();

    let fence = Fence {
        allowed_directories: vec!["/workspace/app".to_string(), "C:\\workspace\\app".to_string()],
        egress_allowlist: vec!["api.sidra.os".to_string(), "github.com".to_string()],
        max_effect_class: EffectClass::Class1_ReversibleLocal,
        spend_ceiling_usd: 50.0,
    };

    let fence_manager = FenceManager::new(fence);
    let mut broker = PermissionBroker::new(fence_manager);

    // Grant legitimate Class 1 capability to 'agent_worker_01'
    let cap = Capability {
        capability_id: "cap_worker_read_write".to_string(),
        grantee_agent_id: "agent_worker_01".to_string(),
        resource: "/workspace/app".to_string(),
        max_effect_class: EffectClass::Class1_ReversibleLocal,
        is_revoked: false,
    };
    broker.grant_capability(cap);

    (vault, broker)
}

#[test]
fn redteam_attack_1_filesystem_escape_attempt() {
    let (vault, broker) = setup_security_environment();

    // Malicious tool attempts path traversal escape to read system passwords / secrets
    let malicious_paths = vec![
        "/workspace/app/../../etc/passwd",
        "C:\\workspace\\app\\..\\..\\Windows\\System32\\config",
        "/etc/shadow",
    ];

    for bad_path in malicious_paths {
        let result = broker.authorize_action(
            vault.connection(),
            "agent_worker_01",
            "cap_worker_read_write",
            "fs:read",
            bad_path,
            EffectClass::Class0_Read,
        );

        assert!(
            matches!(result, Err(SecurityError::PathTraversalDenied { .. })),
            "Malicious path traversal '{}' MUST be denied by FenceManager",
            bad_path
        );
    }

    // Verify security denial was logged into Vault event log
    let events = EventLogRepository::read_all(vault.connection()).unwrap();
    let denial_logged = events
        .iter()
        .any(|e| e.event_type == "security.filesystem_escape_denied");
    assert!(denial_logged, "Filesystem escape denial MUST be recorded in audit log");
}

#[test]
fn redteam_attack_2_unlisted_network_egress_attempt() {
    let (vault, broker) = setup_security_environment();

    // Malicious tool attempts data exfiltration to an unlisted external server
    let malicious_urls = vec![
        "http://exfiltration-server.attacker.com/steal",
        "https://malicious-c2.net/command",
    ];

    for bad_url in malicious_urls {
        let result = broker.authorize_action(
            vault.connection(),
            "agent_worker_01",
            "cap_worker_read_write",
            "http:post",
            bad_url,
            EffectClass::Class2_IrreversibleExternal,
        );

        assert!(
            matches!(result, Err(SecurityError::EgressDenied { .. })),
            "Unlisted egress URL '{}' MUST be denied by EgressFilter",
            bad_url
        );
    }

    // Verify security denial was logged into Vault event log
    let events = EventLogRepository::read_all(vault.connection()).unwrap();
    let denial_logged = events
        .iter()
        .any(|e| e.event_type == "security.unlisted_egress_denied");
    assert!(denial_logged, "Unlisted egress denial MUST be recorded in audit log");
}

#[test]
fn redteam_attack_3_capability_escalation_attempt() {
    let (vault, broker) = setup_security_environment();

    // Malicious tool attempts Class 3 action (e.g. key deletion/financial transaction) with Class 1 token
    let result = broker.authorize_action(
        vault.connection(),
        "agent_worker_01",
        "cap_worker_read_write",
        "crypto:delete_master_key",
        "keychain://master",
        EffectClass::Class3_CriticalHumanSignature,
    );

    assert!(
        matches!(result, Err(SecurityError::AccessDenied { .. })),
        "Capability escalation to Class 3 MUST be denied by PermissionBroker"
    );

    // Verify security denial was logged into Vault event log
    let events = EventLogRepository::read_all(vault.connection()).unwrap();
    let denial_logged = events
        .iter()
        .any(|e| e.event_type == "security.effect_class_escalation_denied");
    assert!(denial_logged, "Capability escalation denial MUST be recorded in audit log");
}

#[test]
fn redteam_attack_4_log_tampering_and_hash_chain_forgery_attempt() {
    let (vault, _broker) = setup_security_environment();

    // 1. Write legitimate events
    let input1 = EventInput {
        event_id: Ulid::new().to_string(),
        event_type: "user.login".to_string(),
        aggregate_type: "user".to_string(),
        aggregate_id: "usr_001".to_string(),
        payload: r#"{"status":"success"}"#.to_string(),
        metadata: "{}".to_string(),
        timestamp: "2026-07-21T12:00:00Z".to_string(),
    };
    EventLogRepository::append(vault.connection(), &input1).unwrap();

    let input2 = EventInput {
        event_id: Ulid::new().to_string(),
        event_type: "vault.transfer".to_string(),
        aggregate_type: "vault".to_string(),
        aggregate_id: "vlt_001".to_string(),
        payload: r#"{"amount":100}"#.to_string(),
        metadata: "{}".to_string(),
        timestamp: "2026-07-21T12:01:00Z".to_string(),
    };
    EventLogRepository::append(vault.connection(), &input2).unwrap();

    // Verify chain is initially valid
    assert!(EventLogRepository::verify_chain(vault.connection()).unwrap());

    // 2. Malicious attacker attempts direct SQL injection/tampering to alter past payload
    vault
        .connection()
        .execute(
            "UPDATE events SET payload = '{\"amount\":1000000}' WHERE sequence = 2",
            [],
        )
        .unwrap();

    // 3. Verify that hash chain verification FAILS and detects log tampering
    let verify_result = EventLogRepository::verify_chain(vault.connection());
    assert!(
        verify_result.is_err(),
        "Log tampering / hash chain forgery MUST be detected by verify_chain()"
    );
}

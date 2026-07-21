use sidra_domain::{Capability, EffectClass, TaskStatus};
use sidra_models::{MockSuccessProvider, ModelProvider, ModelRouter};
use sidra_orchestrator::Orchestrator;
use sidra_security::FenceManager;
use sidra_security::PermissionBroker;
use sidra_store::{EventLogRepository, Vault};
use std::sync::Arc;

#[test]
fn test_m6_exit_criterion_multi_agent_cooperation_and_provenance_tracing() {
    let vault = Vault::open_in_memory().unwrap();

    // 1. Configure Model Router
    let mock_provider: Arc<dyn ModelProvider> = Arc::new(MockSuccessProvider::new("mock_llm"));
    let router = ModelRouter::new(vec![mock_provider]);

    // 2. Configure Security Permission Broker
    let fence = sidra_domain::Fence {
        allowed_directories: vec!["/workspace/app".to_string()],
        egress_allowlist: vec!["api.sidra.os".to_string()],
        max_effect_class: EffectClass::Class1_ReversibleLocal,
        spend_ceiling_usd: 100.0,
    };
    let fence_manager = FenceManager::new(fence);
    let mut broker = PermissionBroker::new(fence_manager);

    // Grant Capabilities to Analyst and Writer agents
    broker.grant_capability(Capability {
        capability_id: "cap_analyst_exec".to_string(),
        grantee_agent_id: "agent_analyst_01".to_string(),
        resource: "system".to_string(),
        max_effect_class: EffectClass::Class1_ReversibleLocal,
        is_revoked: false,
    });
    broker.grant_capability(Capability {
        capability_id: "cap_analyst_exec".to_string(),
        grantee_agent_id: "agent_writer_01".to_string(),
        resource: "system".to_string(),
        max_effect_class: EffectClass::Class1_ReversibleLocal,
        is_revoked: false,
    });

    let orchestrator = Orchestrator::new(router, broker);

    // 3. Execute multi-step task across Analyst and Writer agents
    let goal = "Ingest document, chunk, vector search, format executive brief";
    let (plan, messages) = orchestrator
        .execute_goal(vault.connection(), goal)
        .expect("Multi-step task execution MUST succeed");

    // 4. Verify Plan Completion
    assert_eq!(plan.status, TaskStatus::Completed);
    assert_eq!(plan.steps.len(), 2, "Task plan MUST be decomposed into 2 steps");
    assert!(plan.steps.iter().all(|s| s.status == TaskStatus::Completed));

    // 5. Verify Inter-Agent Messages & Mandatory Provenance Tags (ADR-0007)
    assert!(!messages.is_empty(), "Inter-agent messages MUST be produced");
    for msg in &messages {
        assert!(!msg.provenance.author_agent_id.is_empty(), "Author agent ID must be set");
        assert!(!msg.provenance.capability_id.is_empty(), "Capability ID must be attached");
        assert!(msg.provenance.authorized_by_principal, "Principal authorization flag must be true");
    }

    // 6. Verify Full State Persistence into Vault Event Log (ADR-0008)
    let events = EventLogRepository::read_all(vault.connection()).unwrap();
    let plan_events = events.iter().any(|e| e.event_type == "task.plan_created");
    let tool_start_events = events.iter().any(|e| e.event_type == "tool.execution_started");
    let tool_done_events = events.iter().any(|e| e.event_type == "tool.execution_completed");

    assert!(plan_events, "Task plan creation MUST be logged to Vault");
    assert!(tool_start_events, "Tool execution start MUST be logged to Vault");
    assert!(tool_done_events, "Tool execution completion MUST be logged to Vault");

    // 7. Verify SHA-256 Hash Chain Integrity
    assert!(
        EventLogRepository::verify_chain(vault.connection()).unwrap(),
        "Vault SHA-256 event log chain MUST be cryptographically valid"
    );
}

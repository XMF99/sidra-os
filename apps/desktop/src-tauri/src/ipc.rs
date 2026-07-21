use sidra_domain::{AgentMessage, Capability, EffectClass, Event, SystemInfo, TaskPlan};
use sidra_kernel::Kernel;
use sidra_models::{MockSuccessProvider, ModelProvider, ModelRouter};
use sidra_orchestrator::Orchestrator;
use sidra_plugins::PluginManager;
use sidra_security::{FenceManager, PermissionBroker};
use sidra_store::{EventLogRepository, Vault};
use std::sync::{Arc, Mutex};
use tauri::State;

pub struct AppState {
    pub kernel: Mutex<Kernel>,
    pub vault: Mutex<Vault>,
    pub orchestrator: Mutex<Orchestrator>,
    pub plugin_manager: Mutex<PluginManager>,
}

impl AppState {
    pub fn new() -> Self {
        let kernel = Kernel::new();
        let vault = Vault::open_in_memory().expect("Failed to open Vault in memory");

        // 1. Model Router
        let mock_provider: Arc<dyn ModelProvider> = Arc::new(MockSuccessProvider::new("desktop_llm"));
        let router = ModelRouter::new(vec![mock_provider]);

        // 2. Security Permission Broker
        let fence = sidra_domain::Fence {
            allowed_directories: vec!["/workspace/app".to_string()],
            egress_allowlist: vec!["api.sidra.os".to_string()],
            max_effect_class: EffectClass::Class1_ReversibleLocal,
            spend_ceiling_usd: 100.0,
        };
        let fence_manager = FenceManager::new(fence);
        let mut broker = PermissionBroker::new(fence_manager);

        // Grant capabilities
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
        let plugin_manager = PluginManager::new("1.0.0");

        Self {
            kernel: Mutex::new(kernel),
            vault: Mutex::new(vault),
            orchestrator: Mutex::new(orchestrator),
            plugin_manager: Mutex::new(plugin_manager),
        }
    }
}

#[derive(serde::Serialize)]
pub struct GoalExecutionResponse {
    pub plan: TaskPlan,
    pub messages: Vec<AgentMessage>,
}

#[tauri::command]
pub fn app_get_status(state: State<'_, AppState>) -> Result<SystemInfo, String> {
    let kernel = state.kernel.lock().map_err(|e| e.to_string())?;
    Ok(kernel.get_status())
}

#[tauri::command]
pub fn app_execute_goal(
    state: State<'_, AppState>,
    goal: String,
) -> Result<GoalExecutionResponse, String> {
    let vault = state.vault.lock().map_err(|e| e.to_string())?;
    let orchestrator = state.orchestrator.lock().map_err(|e| e.to_string())?;

    let (plan, messages) = orchestrator.execute_goal(vault.connection(), &goal)?;
    Ok(GoalExecutionResponse { plan, messages })
}

#[tauri::command]
pub fn app_get_event_log(state: State<'_, AppState>) -> Result<Vec<Event>, String> {
    let vault = state.vault.lock().map_err(|e| e.to_string())?;
    EventLogRepository::read_all(vault.connection()).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn app_verify_event_chain(state: State<'_, AppState>) -> Result<bool, String> {
    let vault = state.vault.lock().map_err(|e| e.to_string())?;
    EventLogRepository::verify_chain(vault.connection()).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn app_get_plugins(state: State<'_, AppState>) -> Result<Vec<String>, String> {
    let _pm = state.plugin_manager.lock().map_err(|e| e.to_string())?;
    Ok(vec!["Analytics Visualizer Plugin (v1.0.0)".to_string()])
}

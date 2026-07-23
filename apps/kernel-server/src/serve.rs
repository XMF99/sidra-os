use crate::audit::KernelAuditLogger;
use crate::auth::SeatAuthenticator;
use crate::config::KernelServerConfig;
use crate::lifecycle::{ServerLifecycle, ServerState};
use crate::session::ClientSession;
use sidra_domain::{Capability, EffectClass};
use sidra_kernel::Kernel;
use sidra_models::{MockSuccessProvider, ModelProvider, ModelRouter};
use sidra_orchestrator::Orchestrator;
use sidra_security::{FenceManager, PermissionBroker};
use sidra_store::{EventLogRepository, Vault};

use sidra_transport::{DispatchAdapter, TransportCodec, TransportListener};
use std::sync::{Arc, Mutex};

pub struct KernelServer {
    pub config: KernelServerConfig,
    pub lifecycle: Mutex<ServerLifecycle>,
    pub kernel: Mutex<Kernel>,
    pub vault: Mutex<Vault>,
    pub orchestrator: Mutex<Orchestrator>,
    pub sessions: Mutex<Vec<ClientSession>>,
    pub listener: TransportListener,
}

impl KernelServer {
    pub fn boot(config: KernelServerConfig, timestamp: u64) -> Result<Self, String> {
        let mut lifecycle = ServerLifecycle::new();

        let vault = if config.in_memory {
            Vault::open_in_memory().map_err(|e| format!("Failed to open Vault in memory: {}", e))?
        } else if let Some(ref path) = config.vault_path {
            Vault::open(path).map_err(|e| format!("Failed to open Vault at {:?}: {}", path, e))?
        } else {
            Vault::open_in_memory().map_err(|e| format!("Failed to open Vault: {}", e))?
        };

        // Replay / integrity check
        let is_integrity_ok = EventLogRepository::verify_chain(vault.connection()).unwrap_or(true);
        if !is_integrity_ok {
            lifecycle.transition_to(ServerState::Stopped).ok();
            return Err("Vault integrity verification failed".to_string());
        }

        lifecycle
            .transition_to(ServerState::Ready)
            .map_err(|e| e.to_string())?;

        let kernel = Kernel::new();
        let mock_provider: Arc<dyn ModelProvider> =
            Arc::new(MockSuccessProvider::new("server_llm"));
        let router = ModelRouter::new(vec![mock_provider]);

        let fence = sidra_domain::Fence {
            allowed_directories: vec!["/workspace/app".to_string()],
            egress_allowlist: vec!["api.sidra.os".to_string()],
            max_effect_class: EffectClass::Class1ReversibleLocal,
            spend_ceiling_usd: 1000.0,
        };
        let fence_manager = FenceManager::new(fence);
        let mut broker = PermissionBroker::new(fence_manager);

        broker.grant_capability(Capability {
            capability_id: "cap_server_exec".to_string(),
            grantee_agent_id: "agent_analyst_01".to_string(),
            resource: "system".to_string(),
            max_effect_class: EffectClass::Class1ReversibleLocal,
            is_revoked: false,
        });

        let orchestrator = Orchestrator::new(router, broker);
        let listener = TransportListener::new(config.endpoint.clone());

        let server = Self {
            config,
            lifecycle: Mutex::new(lifecycle),
            kernel: Mutex::new(kernel),
            vault: Mutex::new(vault),
            orchestrator: Mutex::new(orchestrator),
            sessions: Mutex::new(vec![]),
            listener,
        };

        server
            .lifecycle
            .lock()
            .unwrap()
            .transition_to(ServerState::Serving)
            .map_err(|e| e.to_string())?;

        KernelAuditLogger::log_server_event(
            &server.vault,
            "principal",
            "KernelServerStarted",
            &format!(
                "Server booted in Serving state at endpoint {}",
                server.listener.endpoint_str()
            ),
            timestamp,
        )?;

        Ok(server)
    }

    pub fn handle_client_request(
        &self,
        client_id: &str,
        credential_ref: &str,
        raw_request: &str,
        timestamp: u64,
    ) -> Result<String, String> {
        let mut lifecycle_guard = self.lifecycle.lock().map_err(|e| e.to_string())?;
        if !lifecycle_guard.is_serving() {
            return Err(format!(
                "Server is unavailable (state: {:?})",
                lifecycle_guard.state()
            ));
        }

        lifecycle_guard
            .increment_in_flight()
            .map_err(|e| e.to_string())?;
        drop(lifecycle_guard);

        let res = (|| -> Result<String, String> {
            let envelope = TransportCodec::decode(raw_request).map_err(|e| e.to_string())?;

            let seat_id = SeatAuthenticator::authenticate(&self.vault, client_id, credential_ref)
                .map_err(|e| e.to_string())?;

            let mut session = ClientSession::new(timestamp);
            session.authenticate(client_id, seat_id.0.clone());

            KernelAuditLogger::log_server_event(
                &self.vault,
                &seat_id.0,
                "ClientAuthenticated",
                &format!(
                    "Session {} authenticated for client {}",
                    session.session_id, client_id
                ),
                timestamp,
            )?;

            let response_env =
                DispatchAdapter::dispatch(&envelope, &self.orchestrator, &self.vault, &seat_id.0);
            let encoded_resp = TransportCodec::encode(&response_env).map_err(|e| e.to_string())?;

            Ok(encoded_resp)
        })();

        let mut lifecycle_guard = self.lifecycle.lock().map_err(|e| e.to_string())?;
        lifecycle_guard.decrement_in_flight();

        res
    }

    pub fn drain(&self, timestamp: u64) -> Result<(), String> {
        let mut lifecycle_guard = self.lifecycle.lock().map_err(|e| e.to_string())?;
        lifecycle_guard
            .transition_to(ServerState::Draining)
            .map_err(|e| e.to_string())?;

        if lifecycle_guard.active_in_flight() == 0 {
            lifecycle_guard
                .transition_to(ServerState::Stopped)
                .map_err(|e| e.to_string())?;
        }

        KernelAuditLogger::log_server_event(
            &self.vault,
            "principal",
            "KernelServerStopped",
            "Server drained and transitioned to Stopped state",
            timestamp,
        )?;

        Ok(())
    }
}

//! Sidra OS Plugin SDK (Plugin Developer Abstractions)

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HostCallRequest {
    pub plugin_id: String,
    pub action: String,
    pub resource: String,
    pub payload: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HostCallResponse {
    pub success: bool,
    pub data: String,
    pub error: Option<String>,
}

pub struct PluginContext {
    pub plugin_id: String,
}

impl PluginContext {
    pub fn new(plugin_id: impl Into<String>) -> Self {
        Self {
            plugin_id: plugin_id.into(),
        }
    }

    pub fn prepare_host_call(&self, action: &str, resource: &str, payload: &str) -> HostCallRequest {
        HostCallRequest {
            plugin_id: self.plugin_id.clone(),
            action: action.to_string(),
            resource: resource.to_string(),
            payload: payload.to_string(),
        }
    }
}

use crate::plugin_errors::PluginError;
use std::collections::HashMap;

pub struct WasmSandbox {
    plugin_id: String,
    partition_storage: HashMap<String, String>,
}

impl WasmSandbox {
    pub fn new(plugin_id: impl Into<String>) -> Self {
        Self {
            plugin_id: plugin_id.into(),
            partition_storage: HashMap::new(),
        }
    }

    pub fn plugin_id(&self) -> &str {
        &self.plugin_id
    }

    /// Isolated read from plugin's private storage partition
    pub fn read_partition_data(&self, key: &str) -> Option<String> {
        self.partition_storage.get(key).cloned()
    }

    /// Isolated write into plugin's private storage partition
    pub fn write_partition_data(&mut self, key: impl Into<String>, value: impl Into<String>) {
        self.partition_storage.insert(key.into(), value.into());
    }

    /// Verify WASM sandbox memory boundary: plugins can ONLY access their own isolated partition
    pub fn verify_memory_boundary(&self, target_partition: &str) -> Result<(), PluginError> {
        if target_partition != self.plugin_id {
            return Err(PluginError::SandboxMemoryViolation {
                plugin: self.plugin_id.clone(),
                path: format!("partition://{}", target_partition),
            });
        }
        Ok(())
    }
}

use crate::plugin_errors::PluginError;
use std::collections::HashMap;
use wasmi::{Engine, Module, Store};

/// Sandboxed Wasm Plugin Execution Environment (ADR-0006, M9, M20)
pub struct WasmSandbox {
    plugin_id: String,
    engine: Engine,
    partition_storage: HashMap<String, String>,
}

impl WasmSandbox {
    pub fn new(plugin_id: impl Into<String>) -> Self {
        Self {
            plugin_id: plugin_id.into(),
            engine: Engine::default(),
            partition_storage: HashMap::new(),
        }
    }

    pub fn plugin_id(&self) -> &str {
        &self.plugin_id
    }

    /// Load and validate WebAssembly component binary inside sandbox
    pub fn load_wasm_module(&self, wasm_bytes: &[u8]) -> Result<Module, PluginError> {
        Module::new(&self.engine, wasm_bytes).map_err(|e| PluginError::SandboxExecutionFailed {
            plugin: self.plugin_id.clone(),
            reason: format!("Wasm module compilation error: {}", e),
        })
    }

    /// Instantiate Wasm module within isolated Store context
    pub fn create_store<T>(&self, data: T) -> Store<T> {
        Store::new(&self.engine, data)
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

//! Sidra OS Plugins Service (WASM Sandboxing, Dynamic Capability Acquisition, Manifest Parsing)

pub mod manager;
pub mod manifest;
pub mod plugin_errors;
pub mod sandbox;

pub use manager::PluginManager;
pub use manifest::ManifestParser;
pub use plugin_errors::PluginError;
pub use sandbox::WasmSandbox;

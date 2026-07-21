//! Sidra OS Kernel Service (Command/Query API, Event Bus, Lifecycle)

use sidra_domain::{AppStatus, SystemInfo};

pub struct Kernel;

impl Kernel {
    pub fn new() -> Self {
        Self
    }

    /// Query current system status and version
    pub fn get_status(&self) -> SystemInfo {
        SystemInfo {
            version: env!("CARGO_PKG_VERSION").to_string(),
            platform: std::env::consts::OS.to_string(),
            status: AppStatus::Ready,
        }
    }
}

impl Default for Kernel {
    fn default() -> Self {
        Self::new()
    }
}

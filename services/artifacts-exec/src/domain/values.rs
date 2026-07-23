//! M20 Executable Artifacts — Core Value Objects
//! Ref: EXECUTABLE_ARTIFACTS_ARCHITECTURE.md §4.1, ADR-0054, ADR-0056

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct ArtifactId(pub String);

impl ArtifactId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn generate() -> Self {
        Self(format!(
            "art_{}",
            ulid::Ulid::new().to_string().to_lowercase()
        ))
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct ModuleHash(pub String);

impl ModuleHash {
    pub fn from_wasm_bytes(bytes: &[u8]) -> Self {
        let mut hasher = Sha256::new();
        hasher.update(bytes);
        Self(format!("{:x}", hasher.finalize()))
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct ArtifactRunId(pub String);

impl ArtifactRunId {
    pub fn generate() -> Self {
        Self(format!(
            "run_{}",
            ulid::Ulid::new().to_string().to_lowercase()
        ))
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, PartialOrd, Ord)]
pub struct Capability(pub String);

impl Capability {
    pub fn parse(cap_str: &str) -> Result<Self, String> {
        let parts: Vec<&str> = cap_str.split('.').collect();
        if parts.len() < 2 || parts[0].is_empty() || parts[1].is_empty() {
            return Err(format!(
                "Invalid capability syntax '{}': must follow domain.action[:scope]",
                cap_str
            ));
        }
        Ok(Self(cap_str.to_string()))
    }

    pub fn is_subset_of(&self, ceiling_grant: &[Capability]) -> bool {
        ceiling_grant.contains(self)
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WasmLimits {
    pub fuel: u64,
    pub memory_mb: u32,
    pub wall_ms: u64,
}

impl Default for WasmLimits {
    fn default() -> Self {
        Self {
            fuel: 50_000_000,
            memory_mb: 64,
            wall_ms: 10_000,
        }
    }
}

impl WasmLimits {
    pub const MAX_FUEL: u64 = 100_000_000;
    pub const MAX_MEMORY_MB: u32 = 128;
    pub const MAX_WALL_MS: u64 = 30_000;

    pub fn validate(&self) -> Result<(), String> {
        if self.fuel > Self::MAX_FUEL {
            return Err(format!(
                "Requested fuel {} exceeds M9 host max {}",
                self.fuel,
                Self::MAX_FUEL
            ));
        }
        if self.memory_mb > Self::MAX_MEMORY_MB {
            return Err(format!(
                "Requested memory {} MB exceeds M9 host max {}",
                self.memory_mb,
                Self::MAX_MEMORY_MB
            ));
        }
        if self.wall_ms > Self::MAX_WALL_MS {
            return Err(format!(
                "Requested wall time {} ms exceeds M9 host max {}",
                self.wall_ms,
                Self::MAX_WALL_MS
            ));
        }
        Ok(())
    }
}

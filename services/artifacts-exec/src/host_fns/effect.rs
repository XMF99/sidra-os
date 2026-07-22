//! M20 Executable Artifacts — Effect Class Routing
//! Ref: EXECUTABLE_ARTIFACTS_ARCHITECTURE.md §8, §10

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum EffectClass {
    Class0Pure,          // Pure / local read (Vault/memory/compute)
    Class1ExternalRead,  // External read via connector
    Class2LocalWrite,     // Reversible local write (versioned)
    Class3Irreversible,  // Irreversible / spend / external write (Always asks approval)
}

impl EffectClass {
    pub fn as_u8(&self) -> u8 {
        match self {
            Self::Class0Pure => 0,
            Self::Class1ExternalRead => 1,
            Self::Class2LocalWrite => 2,
            Self::Class3Irreversible => 3,
        }
    }
}

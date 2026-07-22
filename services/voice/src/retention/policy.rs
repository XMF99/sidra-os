use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum RetentionPolicy {
    DiscardAfterTranscribe, // Default: audio memory cleared immediately on Draft entry
    RetainLocal { purge_window_hours: u32 }, // Local encrypted Vault storage only, purgeable
}

impl Default for RetentionPolicy {
    fn default() -> Self {
        Self::DiscardAfterTranscribe
    }
}

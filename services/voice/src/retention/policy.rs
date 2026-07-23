use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
pub enum RetentionPolicy {
    #[default]
    DiscardAfterTranscribe, // Default: audio memory cleared immediately on Draft entry
    RetainLocal {
        purge_window_hours: u32,
    }, // Local encrypted Vault storage only, purgeable
}

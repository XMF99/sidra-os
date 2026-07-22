use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoiceAudioPurgedEvent {
    pub capture_id: String,
    pub purged_at: u64,
    pub reason: String,
}

pub fn purge_audio(capture_id: &str, now: u64) -> VoiceAudioPurgedEvent {
    VoiceAudioPurgedEvent {
        capture_id: capture_id.to_string(),
        purged_at: now,
        reason: "user_or_scheduled_purge".to_string(),
    }
}

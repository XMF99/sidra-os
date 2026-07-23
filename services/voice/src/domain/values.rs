//! M19 Voice Directive — Core Domain Value Objects
//! Ref: VOICE_DIRECTIVE_ARCHITECTURE.md §4.1, §4.2, ADR-0052, ADR-0053

use crate::retention::policy::RetentionPolicy;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ModelId(pub String);

impl ModelId {
    pub fn default_whisper() -> Self {
        Self("whisper-base-en.onnx".to_string())
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ModelVersion(pub String);

impl ModelVersion {
    pub fn default_version() -> Self {
        Self("1.0.0".to_string())
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TranscriptText {
    pub content: String,
    pub is_final: bool,
}

impl TranscriptText {
    pub fn new(content: impl Into<String>, is_final: bool) -> Self {
        Self {
            content: content.into(),
            is_final,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct CaptureId(pub String);

impl CaptureId {
    pub fn generate() -> Self {
        use sha2::{Digest, Sha256};
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_nanos();
        let mut hasher = Sha256::new();
        hasher.update(format!("capture-{}", now).as_bytes());
        Self(format!("cap_{:x}", hasher.finalize())[..16].to_string())
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AudioRef {
    pub vault_path: String, // LOCAL Vault path only - NEVER a URL or remote reference
}

impl AudioRef {
    pub fn new_local(path: impl Into<String>) -> Self {
        Self {
            vault_path: path.into(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoiceCaptureRecord {
    pub id: CaptureId,
    pub started_at: u64,
    pub ended_at: Option<u64>,
    pub model_id: ModelId,
    pub model_version: ModelVersion,
    pub transcript_hash: Option<String>,
    pub retention_mode: RetentionPolicy,
    pub audio_ref: Option<AudioRef>,
    pub purge_at: Option<u64>,
    pub directive_id: Option<String>,
}

impl VoiceCaptureRecord {
    pub fn new(id: CaptureId, started_at: u64) -> Self {
        Self {
            id,
            started_at,
            ended_at: None,
            model_id: ModelId::default_whisper(),
            model_version: ModelVersion::default_version(),
            transcript_hash: None,
            retention_mode: RetentionPolicy::DiscardAfterTranscribe,
            audio_ref: None,
            purge_at: None,
            directive_id: None,
        }
    }
}

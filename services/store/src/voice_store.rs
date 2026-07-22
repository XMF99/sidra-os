//! M19 Voice Directive — Store Persistence Engine
//! Ref: VOICE_DIRECTIVE_ARCHITECTURE.md §11.1, ADR-0052, ADR-0053

use crate::errors::StoreError;
use rusqlite::{params, Connection};
use sidra_voice::{CaptureId, InputMethod, RetentionPolicy, VoiceCaptureRecord};

pub struct VoiceStoreRepository;

impl VoiceStoreRepository {
    /// Inserts a new directive into directives table with input_method provenance ('typed' or 'voice').
    pub fn insert_directive(
        conn: &Connection,
        id: &str,
        body: &str,
        source: &str,
        input_method: InputMethod,
        now: u64,
    ) -> Result<(), StoreError> {
        let method_str = match input_method {
            InputMethod::Typed => "typed",
            InputMethod::Voice => "voice",
        };

        conn.execute(
            "INSERT INTO directives (id, body, source, input_method, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![id, body, source, method_str, now],
        )?;

        Ok(())
    }

    /// Inserts initial voice capture record into voice_captures table.
    pub fn insert_voice_capture(
        conn: &Connection,
        record: &VoiceCaptureRecord,
    ) -> Result<(), StoreError> {
        let mode_str = match record.retention_mode {
            RetentionPolicy::DiscardAfterTranscribe => "DiscardAfterTranscribe",
            RetentionPolicy::RetainLocal { .. } => "RetainLocal",
        };

        let audio_ref_str = record.audio_ref.as_ref().map(|r| r.vault_path.as_str());

        conn.execute(
            "INSERT INTO voice_captures (id, directive_id, model_id, model_version, transcript_hash, retention_mode, audio_ref, purge_at, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                record.id.0,
                record.directive_id,
                record.model_id.0,
                record.model_version.0,
                record.transcript_hash,
                mode_str,
                audio_ref_str,
                record.purge_at,
                record.started_at,
            ],
        )?;

        Ok(())
    }

    /// Updates voice capture record when transcript is finalized.
    pub fn finalize_voice_capture(
        conn: &Connection,
        id: &CaptureId,
        directive_id: &str,
        transcript_hash: &str,
        ended_at: u64,
    ) -> Result<(), StoreError> {
        conn.execute(
            "UPDATE voice_captures 
             SET directive_id = ?1, transcript_hash = ?2, purge_at = ?3
             WHERE id = ?4",
            params![directive_id, transcript_hash, ended_at, id.0],
        )?;
        Ok(())
    }

    /// Deletes retained local audio reference on demand or purge schedule.
    pub fn purge_voice_audio(conn: &Connection, id: &CaptureId) -> Result<(), StoreError> {
        conn.execute(
            "UPDATE voice_captures SET audio_ref = NULL WHERE id = ?1",
            params![id.0],
        )?;
        Ok(())
    }
}

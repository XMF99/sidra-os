-- M19 Voice Directive: 0038_voice_captures.sql
-- Local audio-retention/provenance record table
-- Holds NO raw audio bytes and NO network references (ADR-0052, VOICE_DIRECTIVE_ARCHITECTURE.md §4.2, §11.1)

CREATE TABLE IF NOT EXISTS voice_captures (
    id TEXT PRIMARY KEY NOT NULL,
    directive_id TEXT,
    model_id TEXT NOT NULL,
    model_version TEXT NOT NULL,
    transcript_hash TEXT NOT NULL,
    retention_mode TEXT NOT NULL DEFAULT 'DiscardAfterTranscribe' CHECK (retention_mode IN ('DiscardAfterTranscribe', 'RetainLocal')),
    audio_ref TEXT,
    purge_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

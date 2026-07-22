-- M19 Voice Directive: 0032_voice_directives.sql
-- Additive projections for local voice transcripts and confirmation state

CREATE TABLE IF NOT EXISTS voice_transcripts (
    transcript_id TEXT PRIMARY KEY NOT NULL,
    session_id TEXT NOT NULL,
    raw_transcript TEXT NOT NULL,
    confirmed_transcript TEXT,
    status TEXT NOT NULL CHECK (status IN ('recording', 'transcribed', 'confirmed', 'discarded')) DEFAULT 'transcribed',
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    confirmed_at INTEGER
);

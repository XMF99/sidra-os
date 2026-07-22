-- M19 Voice Directive: 0032_voice_directives.sql
-- Local voice transcript confirmation projections (aligns with VOICE_DIRECTIVE_ARCHITECTURE.md §5, §11.1)

CREATE TABLE IF NOT EXISTS voice_transcripts (
    transcript_id TEXT PRIMARY KEY NOT NULL,
    session_id TEXT NOT NULL,
    raw_transcript TEXT NOT NULL,
    confirmed_transcript TEXT,
    status TEXT NOT NULL CHECK (status IN ('capturing', 'transcribing', 'draft', 'discarded', 'submitted')) DEFAULT 'draft',
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    confirmed_at INTEGER
);


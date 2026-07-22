-- M11 Department Substrate: 0004_memory_fs_scoping.sql
-- Adds memory_chunks.namespace (nullable) and fs_scope projection support

CREATE TABLE IF NOT EXISTS memory_chunks (
    chunk_id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL,
    content TEXT NOT NULL,
    token_count INTEGER NOT NULL,
    embedding TEXT NOT NULL,
    created_at TEXT NOT NULL
);

ALTER TABLE memory_chunks ADD COLUMN namespace TEXT;
CREATE INDEX IF NOT EXISTS idx_memory_chunks_namespace ON memory_chunks(namespace);

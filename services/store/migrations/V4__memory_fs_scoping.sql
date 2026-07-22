-- M11 Department Substrate: 0004_memory_fs_scoping.sql
-- Adds memory_chunks.namespace (nullable) and fs_scope projection support

ALTER TABLE memory_chunks ADD COLUMN namespace TEXT;
CREATE INDEX IF NOT EXISTS idx_memory_chunks_namespace ON memory_chunks(namespace);

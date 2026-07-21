# ADR-0003 — SQLite + SQLCipher in a single-file Vault

**Status:** Accepted · **Date:** design phase · **Supersedes:** —

## Context

The Principal's Vault holds their working life: sources, Deliverables, Decisions, and the Firm's memory. It
must be local-first (Principle 7), encrypted at rest, backed up by copying, exportable without a proprietary
tool, and fast enough for sub-120 ms hybrid retrieval over 100k chunks.

## Options

1. **SQLite + SQLCipher, single file, plus a Markdown mirror.**
2. **Postgres embedded / local server.** Better concurrency and richer vector support; a background service to
   install, upgrade, and debug on three platforms for a single-user application.
3. **A document store (e.g. an embedded KV) plus a separate vector index.** Two stores to keep consistent,
   two failure modes, no transactions across them — which breaks the event-log guarantee immediately.
4. **Files on disk as the primary store.** Maximally legible, hopeless for query and retrieval, and offers no
   transactional boundary for the event chain.

## Decision

SQLite via `rusqlite` with SQLCipher for encryption, `sqlite-vec` for embeddings, and FTS5 for lexical search
— one file, one transaction boundary, one thing to back up. A human-readable Markdown mirror of records is
written alongside it under `~/Sidra/Records/`, read-only, for legibility and for the case where the Principal
wants their content without our software.

## Consequences

**Accepted:** single-writer concurrency. This is correct for a single-user desktop app and is handled with a
write queue in the store crate; it becomes a real constraint in 3.0, at which point the hosted deployment
substitutes a different backend behind the same store interface — which is why the store interface exists.

**Accepted:** `sqlite-vec` is younger than the alternatives. It is an exact-search extension, which for a
100k-chunk corpus is fast enough and avoids the recall cliff of approximate indexes at small scale. If it
proves inadequate the interface allows an HNSW index behind the same trait.

**Accepted:** SQLCipher means the database is opaque to standard SQLite tooling without the key. The Markdown
mirror and the full export exist so that opacity never becomes lock-in.

**Gained:** backup is copying a directory. Integrity is one transaction. Export is not a feature we bolt on.

**Constraint:** the key lives in the OS keychain and never in the Vault, never in the database, never in a
log. There is no recovery path for a lost passphrase, and first-run says so in plain words.

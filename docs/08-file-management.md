# File Management

The Vault is the Principal's, not the application's. Everything the Firm produces is a real file on disk,
readable without Sidra OS.

## 1. Principles

1. **Files are outputs, not attachments.** An artifact is a first-class record with provenance, versions,
   and a reviewer — not a blob hanging off a chat message.
2. **Nothing is overwritten.** Every save creates a version; the previous one remains.
3. **Nothing is deleted by an agent.** Deletion is effect class 3 and requires the Principal.
4. **The filesystem is legible.** Directory and file names are meaningful to a human browsing in Finder.
5. **The database and the filesystem agree.** A reconciliation pass on startup detects drift and reports it
   rather than silently resolving it.

## 2. Layout

See [../02-architecture/03-folder-structure.md](../02-architecture/03-folder-structure.md) §2. In short:
`Artifacts/` by year/month/engagement, `Sources/` for everything ingested with originals preserved,
`Records/` for the Markdown mirror of Briefs, Decisions, and Minutes, `Exports/` for user exports.

## 3. Artifact anatomy

Every artifact carries front-matter (for text formats) or a sidecar `_meta.json` (for binary):

```yaml
---
artifact: art_01J8ZK…
engagement: eng_01J8ZK…
title: "Invoicing specification"
kind: spec
version: 2
author: agent.pm            # null when the Principal edited it
reviewed_by: agent.qa       # verdict: pass_with_notes
sources: [doc_01J8…, canon:billing.currency, dec_0031]
created: 2026-07-21T11:12:04Z
---
```

This is what makes an artifact trustworthy six months later: you can see who wrote it, who checked it, what
it was based on, and which decision constrained it.

## 4. Versioning

- Every `vault.write` creates version n+1; version n stays at `name.v{n}.ext`.
- Text formats get a structural diff view (headings-aware, not line-noise).
- Binary formats get metadata diff plus a preview comparison where possible.
- Version history is unbounded by default with a size-based prune policy (keep all versions under 10 MB
  total per artifact; beyond that, keep first, last, and every reviewed version).
- Reverting is a new version, never a deletion.

## 5. External edits

A file watcher monitors the Vault:

| Change | Response |
|---|---|
| Principal edits an artifact | New version attributed to the Principal, `edited_by_principal = 1`; offer "Have Argus review the changes?" |
| New file appears in `Sources/inbox/` | Ingest automatically (if the automation is enabled), otherwise surface it |
| File deleted externally | Record the absence, keep the metadata, mark the artifact `missing` — never silently forget it existed |
| File modified while an agent is writing it | Conflict: both versions retained, Principal chooses |

The Principal's edits always win. The Firm never overwrites something a human touched.

## 6. Export

`artifact.export` supports Markdown, HTML, PDF, DOCX, and XLSX where applicable. Export includes an optional
provenance appendix — sources, reviewer, and decision links — which is off by default and one keystroke on,
because the Principal often needs to hand a clean document to someone outside the Firm.

## 7. Trash and purge

Deletion moves to `.trash/` with a tombstone record, excluded from retrieval, restorable for 30 days. Purge
is explicit, names exactly what will be destroyed, and writes a purge event with a count and reason. The
audit chain records that a purge happened even when the content is gone — the *fact* of deletion is never
deletable.

## 8. Integrity

- Every file is hashed on write; the hash is stored with the artifact record.
- The nightly health check verifies a sample of hashes and reports mismatches.
- Encryption is per-file AES-256-GCM with a key derived from the Vault key, so a copied file is useless
  without the Vault.
- Snapshots cover the DB; the Vault directory is covered by whatever backup the Principal uses, and the
  system tells him plainly that this is his responsibility and what it would cost to lose it.

## 9. The Vault room

The UI surface: a resizable file tree, preview pane, version history with diff, metadata panel showing
provenance, and actions — open in default app, reveal in Finder/Explorer, export, ingest into memory, ask
about this file (creates a Directive with the file as context), and forget. Keyboard-navigable throughout,
because the Principal will live here.

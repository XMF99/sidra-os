# Knowledge Base

Ingestion, curation, and the path from a dropped file to a cited fact.

## 1. Pipeline

```
INGEST ──► EXTRACT ──► STRUCTURE ──► CHUNK ──► EMBED ──► INDEX ──► DISTIL ──► RECONCILE
```

| Stage | What happens | Failure handling |
|---|---|---|
| Ingest | Original bytes copied to `Vault/Sources/`, hashed, deduped | Duplicate hash → link to the existing document, do not re-process |
| Extract | Text + layout per format (see §2) | Report which pages/sheets failed and why; never silently drop content |
| Structure | Detect headings, sections, tables, code, lists; build a document outline | Fallback to paragraph segmentation, flagged as low structure |
| Chunk | Structure-aware, 200–800 tokens, never straddling a boundary; carry `heading_path` and `locator` | — |
| Embed | Batched, 1024-dim, low-priority pool | Retry; a chunk without an embedding is still lexically searchable |
| Index | FTS5 + vec insert in one transaction with the chunks | Transactional: partial indexes cannot exist |
| Distil | Extract candidate Canon facts with page citations and confidence | Low-confidence candidates are held, not asserted |
| Reconcile | Check candidates against existing Canon; open Reconciliations on conflict | Always the Principal's call |

## 2. Format support (1.0)

| Format | Extraction | Notes |
|---|---|---|
| PDF (text) | Layout-aware text with page numbers | Columns detected; headers/footers stripped |
| PDF (scanned) | Rasterize → `vision` class OCR | Per-page confidence; low-confidence pages listed, not silently ingested |
| DOCX | Paragraphs, headings, tables, comments | Tracked changes preserved as annotations |
| XLSX / CSV | Sheet → structured table; each sheet a document section | Formulas kept as text; locator is `Sheet!A1:D30` |
| Markdown / TXT | Native structure | The preferred format |
| HTML / URL | Readability extraction, archived with URL + timestamp | Always archived; the web is not a stable source |
| Images | `vision` description + OCR | Description is `inference` trust, never `document` |
| Code | Language-aware chunking by symbol | Locator is `path:L120-160` |

Plugins add formats via the `ingestor` extension point.

## 3. Provenance

Every chunk knows: document, page/locator, heading path, ingestion date, extraction confidence, and trust
level. Every Canon entry knows its source chunk or Decision. Every claim in a Brief carries the ids it came
from, rendered as citations in the UI.

**The rule: no assertion without provenance.** An agent that cannot cite a source must mark the statement as
an inference with a confidence, and that marking propagates all the way into the Brief. This is the
mechanism that makes the difference between "the contract renews in March" and "I believe the contract
renews in March (inferred, 0.6)."

## 4. Canon curation

See [../03-agents/05-memory-architecture.md](../03-agents/05-memory-architecture.md) §6 for the data model.
Operationally:

| Path | Confidence | Requires |
|---|---|---|
| Principal states it | 1.0 | Nothing |
| Decision produces it | 0.95 | The Decision record |
| Extracted from a document | 0.6–0.9 | A page citation |
| Inferred by an agent | ≤0.6 | Explicit marking, and it stays out of confident assertions |

Canon is deliberately small. Target: under 500 active entries. It is the Firm's constitution, not its
library — the library is Semantic memory. If Canon grows past ~800 entries, the weekly corpus health check
flags it and proposes demotions.

## 5. Coverage and gaps

Quill tracks where the corpus is thin relative to what the Principal actually asks about. The weekly corpus
health report answers: which subjects were queried with no good retrieval hit; which Canon entries are older
than their subject's typical change rate; which documents have never been retrieved (candidates for
archiving). Knowing what you do not know is a retrievable property here, not a philosophical one.

## 6. Search Everywhere integration

The knowledge base is one of seven federated result types. Chunks return with document title, heading path,
locator, and a highlighted excerpt. Selecting a result offers: open the source at that page, cite it in a
Directive, forget it, or promote its claim to Canon.

## 7. Ingestion UX

Requirements:
- Drag-and-drop anywhere in the window. The drop overlay names the file and offers treatment.
- Progress reports real stages with real counts (`Embedding 612 chunks`), never a fake percentage.
- Failures explain themselves: *"Pages 40–44 are scanned images with low OCR confidence. They are indexed
  but marked unreliable. Open them?"*
- Everything is cancellable, and cancellation leaves no half-indexed state.
- Re-ingesting a changed file creates a new version and diffs the extracted facts, so a contract amendment
  surfaces exactly what changed.

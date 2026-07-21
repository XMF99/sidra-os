# Memory Architecture

Memory is the substrate, not a feature. It is what makes the Firm an organization that accumulates rather
than a tool that resets.

## 1. Five layers

| Layer | Analogue | Lifetime | Store | Written by |
|---|---|---|---|---|
| **Working** | What you are holding in mind right now | One Turn | In-memory `ContextFrame` | Context builder |
| **Episodic** | What happened | Permanent (compacted) | `events`, `turns`, `tool_calls` | Kernel, automatically |
| **Semantic** | What is known | Permanent, decayed | `chunks` + `chunk_vectors` + `chunks_fts` | Quill via ingestion |
| **Procedural** | How we do things here | Permanent, versioned | `playbooks` | Quill via consolidation, Principal-approved |
| **Canon** | What is true for this Firm | Permanent, versioned, contested-aware | `canon` | Proposed by agents, confirmed by the Principal |

The layers differ in *how they are written* and *how they are trusted*, which is the point. Episodic memory
is automatic and cheap; Canon is deliberate and authoritative. Confusing the two — treating everything an
agent said as fact — is the standard failure of AI memory systems.

## 2. Working memory

Assembled per Turn, budgeted, hashed, and recorded. See
[../02-architecture/02-system-design.md](../02-architecture/02-system-design.md) §7 for the pipeline and
budget split. Two properties matter:

- **Every item is attributed.** `turn_context_items` records exactly what the agent saw, with scores. This
  is what powers the Inspector's "what did it read?" and makes hallucination diagnosable.
- **Frames are deterministic.** The same inputs produce the same frame, so a Turn is reproducible and
  cacheable.

## 3. Episodic memory

The event log. Append-only, hash-chained, totally ordered. Everything is an event: Turns, tool calls,
Decisions, approvals, edits by the Principal, notifications, failures.

Queried three ways:
1. **Timeline** — by engagement, for the trace view.
2. **Recency** — last N events of a kind, for context assembly.
3. **Summarized** — long Engagements are compacted into episode summaries by the Night Shift so a
   three-day Engagement still fits in a frame.

Compaction rule: events older than 24 months collapse into daily digests. The digest records the hash range
it replaces, so the audit chain still verifies. Originals move to `.snapshots` and remain restorable.

## 4. Semantic memory

**Chunking** is structure-aware, not fixed-size. The chunker walks the document's real structure —
headings, sections, list groups, table blocks, code fences — and emits chunks of 200–800 tokens that never
straddle a semantic boundary. Each carries `heading_path` and a `locator` (`p.42`, `L120-160`,
`Sheet1!A1:D30`) so every retrieved fact can be cited precisely. Overlap is 15% at boundaries only.

**Embedding**: 1024-dim, batched, on the low-priority pool. Re-embedding on model change is a background
migration, never a blocking one.

**Retrieval** is hybrid, and the fusion is the interesting part:

```
lexical  = FTS5 BM25(query)                    → top 50
semantic = vec_distance(embed(query))          → top 50
fused    = RRF(lexical, semantic, k=60)                    # rank fusion, not score averaging
scored   = fused × recency_boost × source_trust × canon_affinity
final    = MMR(scored, λ=0.7) → top k                      # diversity, not eight copies of one page
```

- **RRF over score-averaging** because BM25 and cosine scores are not commensurable; ranks are.
- **`source_trust`** weights Principal-authored > Firm artifacts > ingested documents > web.
- **`canon_affinity`** boosts chunks that support or contradict a Canon entry relevant to the query —
  contradictions are *more* interesting, not less.
- **MMR** stops the frame filling with eight near-duplicate chunks from the same section.
- A **relevance floor** applies: it is better to return five good chunks than twenty padded ones.

**Decay**: chunks unretrieved for 180 days and not linked to any Canon entry drop in ranking (never
deleted). Retrieval counts are tracked, which also tells Quill where the corpus is dead weight.

## 5. Procedural memory

A Playbook is a named, ordered procedure with agents and acceptance criteria — a workflow template learned
from experience rather than authored.

Creation path: the Night Shift detects that a similar Engagement shape has occurred three or more times with
acceptance. It drafts a Playbook and puts it in the Morning Brief digest as a proposal. The Principal
approves, edits, or rejects. Approved Playbooks are offered by Kai during Strategize ("we have done this
before — use the playbook?") and their success rate is tracked. A Playbook whose success rate falls below
70% over five uses is automatically retired to `proposed` for review.

Playbooks are data (YAML), not code, so they are diffable, portable, and editable by hand.

## 6. Canon

Canon is the Firm's ground truth: statements the whole organization treats as given.

```
subject:     "pricing.model"
statement:   "Usage-based with a $49 floor; annual only for enterprise."
scope:       firm
confidence:  1.0
source:      decision:dec_01J8… (Principal, 2026-03-14)
valid_from:  2026-03-14
status:      active
```

**Trust levels by source:** `principal` (1.0, asserted directly) > `decision` (0.95) > `document` (0.6–0.9
by extraction confidence) > `inference` (≤0.6, always marked). Only Principal- and Decision-sourced entries
are stated without hedging in Briefs.

**Contradiction detection** runs on every write: a new entry with the same `subject` and an overlapping
validity window whose statement is semantically incompatible with the existing one creates a
`reconciliations` row and sets both to `contested`. Contested Canon is **excluded from confident assertion**
until resolved but is still retrievable, flagged.

**Reconciliation** is always the Principal's call, presented as: old value with its source and date, new
value with its source and date, and four options — keep old, accept new, both true in different scopes, or
both wrong. This is one of very few things the Firm will interrupt for, because unresolved contradictions
poison everything downstream.

**Temporal validity**: Canon is not overwritten. A superseding entry sets `valid_to` on the old one and
links via `supersedes`. "What did we believe in March?" is answerable.

## 7. Private lanes

Each agent accumulates observations only it can retrieve: Argus's defect patterns, Kai's model of the
Principal's preferences, Orin's record of what phrasings measured better. Private lanes are what make
agents genuinely different over time rather than differently-labelled.

Rules: private lanes are visible to the Principal (nothing is hidden from him); they cannot contain claims
about the world, only observations about work patterns; they decay faster (90 days) because patterns go
stale; and promoting anything from a private lane to Canon requires the normal proposal path.

## 8. Consolidation — the Night Shift

Runs nightly at 02:00, chaired by Quill with Orin. Budget-capped and fully skippable.

| Stage | What it does |
|---|---|
| 1. Episode summarization | Compress the day's Engagements into episode summaries with outcomes |
| 2. Fact extraction | Propose Canon candidates from the day's Decisions, artifacts, and Principal corrections |
| 3. Contradiction sweep | Check new facts against Canon; open Reconciliations |
| 4. Deduplication | Merge near-identical chunks; collapse re-ingested documents by hash |
| 5. Pattern detection | Look for repeated Engagement shapes → propose Playbooks |
| 6. Decay and pruning | Age retrieval scores; retire private-lane entries past 90 days |
| 7. Index maintenance | Rebuild FTS, re-embed anything stale, `VACUUM` weekly |
| 8. Health check | Snapshot, verify restore, verify the audit chain |
| 9. Digest | Write the overnight section of tomorrow's Morning Brief |

The digest is what the Principal sees: *what the Firm learned, what it now contradicts, what it wants
approved.* Usually three lines. Sometimes "nothing notable", which is a legitimate and welcome result.

## 9. Forgetting

Deliberate forgetting is a first-class operation, because a memory system you cannot correct is worse than
none.

| Action | Effect |
|---|---|
| **Correct** | Assert a new Canon entry that supersedes; both are retained with dates |
| **Forget** | Tombstone a chunk, document, or Canon entry: excluded from all retrieval, retained in the audit log |
| **Purge** | Hard delete including from audit, recorded as a purge event with the reason and count. Requires explicit confirmation naming what will be destroyed |
| **Scope** | Mark content `sensitive`, restricting which providers may ever see it |

Any retrieved item in the Inspector has a "Forget this" action, so correction happens at the moment the
Principal notices the problem — not in a settings screen he will never open.

## 10. Failure modes and mitigations

| Failure | Symptom | Mitigation |
|---|---|---|
| Context poisoning | One wrong fact propagates into everything | Canon confidence gating; contradiction detection; per-claim provenance in Briefs |
| Retrieval drift | Quality falls as the corpus grows | Orin's precision@8 eval on a fixed set, run weekly; alert on regression |
| Memory bloat | Slow retrieval, noisy frames | Decay, dedup, MMR, relevance floor, retrieval-count pruning |
| Stale Canon | Confident answers from an outdated world | `valid_to`, review dates on Decisions, staleness sweep in the weekly corpus health check |
| Over-personalization | Kai's model of the Principal ossifies | Private lane decay; monthly review of inferred preferences with the Principal |
| Injection via ingested text | An adversarial document steers an agent | Trust tags, capability isolation, detection — see security doc §7 |

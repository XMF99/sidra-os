# Logging and Observability

Three separate systems with three different jobs: an **audit chain** (what happened, tamper-evident), a
**trace** (why an output exists), and **diagnostics** (why the software misbehaved).

## 1. Audit chain

The `events` table, hash-chained:

```
hash_n = SHA-256( hash_{n-1} ‖ canonical_json(event_n) )
```

- Genesis hash is written at Vault creation and stored in `preferences`.
- `audit.verify` walks the chain and reports the first break by sequence number. It runs nightly, on
  startup after an unclean shutdown, and on demand.
- Compaction preserves verifiability: a compacted range is replaced by a digest event carrying the range's
  start and end hashes.
- The chain proves *integrity*, not secrecy — anyone with the Vault key can read it. Its purpose is that no
  process, including a bug in this application, can silently rewrite history.

Every event answers: when, who (agent / principal / system), what kind, about what subject, and with what
payload. Nothing that affects state is exempt.

## 2. Trace

The trace answers the question that makes delegation possible: **why does this output say what it says?**

For any artifact, finding, or Brief claim, one keystroke (⌘I) shows:

```
Brief claim
 └── Deliverable (Vega, WO-0031)
      ├── Turn t_01J8… — model: worker/mid-tier, 12.4 s, $0.031
      │    ├── Context: 24 items
      │    │    ├── canon: billing.currency (Principal, 2026-02-11, conf 1.0)
      │    │    ├── chunk: contract.pdf p.42 (score 0.81)
      │    │    └── … 22 more, each with score and token count
      │    └── Tool calls: memory.search ×2, vault.read ×1
      ├── Review (Argus) — pass_with_notes, 2 findings
      └── Authorized by: Mandate mnd_01J8… (Principal, 09:41)
```

Every level is expandable to the raw prompt and completion if the Principal wants it. This is a shipping
feature, not a debug flag (Principle 4).

## 3. Cost accounting

Recorded at Turn granularity and rolled up:

| Level | Where it appears |
|---|---|
| Turn | Trace view |
| Work Order | Progress spine node |
| Engagement | Brief footer, live meter during execution |
| Agent / day / month | Console ledger |
| Model class | Console, and Orin's routing report |

Fields per Turn: prompt tokens, output tokens, cached tokens, model id, class, latency, cost in cents, and
the routing rule number that selected the class. Cache hit rate is a first-class metric because it is the
cheapest lever on cost.

Reconciliation: estimated cost is written before the call, actual after. Drift is tracked; systematic
underestimation is a bug and appears in the Console.

## 4. Metrics

Local only. Never transmitted. Retained 90 days at 1-minute resolution, then hourly for a year.

| Category | Metrics |
|---|---|
| Throughput | Engagements/day, Turns/day, Work Orders by status |
| Latency | Directive→Mandate, Directive→Brief (p50/p95), Turn latency by class |
| Quality | Review verdict distribution, rework rate, acceptance rate, escalation rate |
| Cost | Spend by scope, cost per accepted Deliverable, cache hit rate |
| Memory | Retrieval precision@8, corpus size, contradiction count, ingestion failures |
| Attention | Interrupts/day, dismissal rate, Brief read rate, action rate |
| System | Frame times, cold start, memory RSS, DB size, index staleness |

## 5. Diagnostics

Structured logs (`tracing` crate), JSON lines, rotated at 20 MB × 5 files, in `Vault/.logs`. Levels:
`error` (a thing failed), `warn` (a thing degraded), `info` (state transitions), `debug` (off by default).

Every log line carries `engagement_id`, `turn_id`, and `request_id` where applicable, so a trace and a log
can be joined. Redaction runs on every write.

**Diagnostic bundle**: ⌘K → "Export diagnostics" produces a zip with logs, metrics, schema version, and
recent events with content stripped. Before writing, it shows exactly what it contains and what it excludes.
Nothing is ever sent anywhere — the Principal chooses what to do with the file.

## 6. Health

The Console shows one health strip, always in the same three lines:

```
Storage    DB 1.2 GB · integrity ok · last snapshot 02:31 · restore verified Sunday
Memory     312,441 chunks · 0 failed ingests · 1 contradiction pending
Runtime    2 Turns running · 0 queued · budget 41% of July · providers ok
```

Green/amber/red is derived from thresholds, not vibes. Amber means degraded but working; red means
something is not working and names it.

## 7. Error taxonomy

Every error has a stable code, a plain sentence, and a suggested action.

| Code | Sentence shown | Suggested action |
|---|---|---|
| `E-BUDGET-01` | "This engagement has reached its $2.00 budget." | Raise the budget, or see what's done |
| `E-FENCE-03` | "Rune needs network access to docs.stripe.com." | Allow once / this session / always |
| `E-MODEL-07` | "The model provider is unavailable. Local work continues." | Retry, or switch provider |
| `E-SCHEMA-02` | "Vega's response didn't match the expected format after three attempts." | Open the trace, or retry with a stronger model |
| `E-STORE-01` | "The Vault couldn't be opened. It may be in use by another instance." | Close the other window |
| `E-INGEST-04` | "Pages 40–44 are scanned images and OCR confidence was low." | Review those pages, or re-scan |

Errors never blame the Principal, never apologize, and never say "something went wrong".

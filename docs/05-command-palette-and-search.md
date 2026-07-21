# Command Palette and Search Everywhere

Two overlays, two jobs. ⌘K is for **doing**. ⌘⇧F is for **finding**. Conflating them is why most command
palettes are mediocre at both.

---

## Part 1 — Command Palette (⌘K)

### 1. Principles

- **Verb-first.** Commands read as instructions: "Start an engagement", "Ingest files", "Pause automation".
  Not "Engagement", "Files", "Automation".
- **Complete.** Every action in the product is invokable here (requirement UI-03). A command that exists
  only as a button is a bug.
- **Fast.** Opens in ≤80 ms; results update within one frame of a keystroke.
- **Teaching.** Every command shows its direct binding on the right, so the palette trains its own
  obsolescence.

### 2. Structure

```
┌─ ⌘K ────────────────────────────────────────────────────────────┐
│  ▸ ingest                                                        │
├──────────────────────────────────────────────────────────────────┤
│  DO                                                              │
│    Ingest files into memory…                              ⌘⇧O    │
│    Ingest a URL…                                                 │
│  GO                                                              │
│    Go to Operations · Quill                                ⌘6    │
│  FIND                                                            │
│    Search for "ingest" everywhere…                        ⌘⇧F    │
│  ASK                                                             │
│    Ask Kai: "ingest"                                     ⌘↵      │
└──────────────────────────────────────────────────────────────────┘
```

Four sections, always in this order. **Ask** is always last and always present — if nothing matches, the
palette becomes the Directive bar rather than a dead end. There is no "no results" state.

### 3. Command surface

| Section | Contents |
|---|---|
| **Do** | Start an engagement · Address an agent · Ingest files / URL · Create an artifact · Convene a meeting · Record a decision · Create an automation · Pause all automation · Export diagnostics · Snapshot the vault · Verify the audit chain · Lock the vault · Toggle focus mode · Toggle inspector · Reset panel sizes · Set the monthly budget · Switch theme |
| **Go** | Any room · any agent · any open Engagement · any recent artifact, Brief, or Decision |
| **Find** | Hands off to Search Everywhere with the current query |
| **Ask** | Submit the typed text as a Directive |

### 4. Arguments

Commands that need input take it inline rather than opening a form:

```
> set budget                    → "Set the monthly budget"
> set budget 200                → "Set the monthly budget to $200.00"      ⏎ applies
> address argus review pricing  → "Ask Argus: review pricing"              ⏎ submits
> go engineering                → "Go to Engineering"                      ⏎ navigates
```

Argument parsing is per-command and shows a live preview of what will happen. Nothing executes on ambiguity.

### 5. Ranking

```
score = fuzzy_match(query, label) × 1.0
      + recency(command)          × 0.3     # exponential decay over 30 days
      + frequency(command)        × 0.2
      + context_affinity(room)    × 0.15    # commands relevant to the current room
      - destructive_penalty       × 0.5     # destructive commands never rank first on a short query
```

Destructive commands (purge, delete, revoke) are demoted and rendered in the danger tone; they never appear
above the fold on a one- or two-character query.

### 6. Keyboard

| Key | Action |
|---|---|
| ⌘K | Open / close |
| ↑ ↓ | Move |
| ⏎ | Run |
| ⇥ | Accept the highlighted command and enter argument mode |
| ⌘⏎ | Ask Kai with the raw text |
| Esc | Close, preserving the query for next open |

---

## Part 2 — Search Everywhere (⌘⇧F)

### 7. Scope

Seven federated types, always searched together:

| Type | Matched on | Ranked by |
|---|---|---|
| Directives & Briefs | Full text | Recency + read status |
| Artifacts | Title, content, front-matter | Version recency, review status |
| Decisions | Question, rationale, options | Reversibility, review date proximity |
| Minutes | Summary, positions, dissents | Recency |
| Canon | Subject, statement | Confidence, validity |
| Chunks (sources) | Hybrid lexical + vector | Fused score with source trust |
| Events | Kind, actor, payload | Recency |

### 8. Two-wave results

Latency is managed by returning what is fast, first:

```
t+0ms    keystroke (40 ms debounce)
t+~60ms  WAVE 1 — lexical: FTS5 across all types. Results render immediately.
t+~180ms WAVE 2 — semantic: vector search fused with wave 1 via RRF; the list
                  re-ranks with a 140 ms cross-fade. Items never jump under the
                  cursor — the highlighted item keeps its identity.
```

Requirement UI-04 (first results ≤200 ms) is met by wave 1; quality is met by wave 2.

### 9. Layout

```
┌─ ⌘⇧F ───────────────────────────────────────────────────────────────────────┐
│  refund policy                                            [ All types  ▾ ]   │
├──────────────────────────────────────────────────────────────────────────────┤
│  DECISIONS (2)                                                               │
│  ▸ Partial refunds are pro-rata                    DEC-0042 · 14 Mar · active │
│      Chosen over "no partial refunds" on 4 criteria. Cass dissented.          │
│  CANON (3)                                                                   │
│  ▸ billing.refund_window — "30 days from invoice"   Principal · 11 Feb · 1.0  │
│  ARTIFACTS (6)                                                               │
│  ▸ invoicing-spec.md §4.2                          v3 · Iris · reviewed      │
│  SOURCES (11)                                                                │
│  ▸ terms-of-service.pdf p.12                       0.81 · ingested 2 Jun     │
└──────────────────────────────────────────────────────────────────────────────┘
```

Grouped by type with counts. ↑↓ moves across groups continuously. ⏎ opens in the Stage. ⌘I previews in the
Inspector without leaving the search. ⌘⏎ starts a Directive with the selected item attached as context.

### 10. Filters and operators

Typed inline, with autocomplete:

```
type:decision              agent:argus            engagement:eng_01J8…
after:2026-06-01           before:last-week       status:active
canon:billing.*            confidence:>0.8        cost:>1.00
```

Filters compose. The filter chip row above the results shows what is applied and can be dismissed
individually.

### 11. Empty and no-result states

- **No query**: shows recent subjects and saved searches. Not a blank field.
- **No results**: names what was searched, and offers the two useful next actions — broaden the filters, or
  ask Kai (because "I couldn't find it" is often a Directive: *"find out whether we ever decided this"*).
- **Corpus thin on this subject**: if Quill's coverage data shows the subject is under-documented, the empty
  state says so and offers to ingest.

### 12. Performance budget

| Operation | Budget |
|---|---|
| Open overlay | ≤60 ms |
| Wave 1 results | ≤120 ms at 300 k chunks |
| Wave 2 fusion | ≤400 ms |
| Preview in Inspector | ≤80 ms |
| Keystroke to re-render | ≤16 ms (one frame) |

Measured in CI against a fixture Vault with 300 k chunks, 5 k events, and 500 artifacts. A regression here
fails the build.

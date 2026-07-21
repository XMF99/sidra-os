# Product Requirements Document — Sidra OS 1.0 "Atrium"

| Field | Value |
|---|---|
| Version | 1.0 |
| Status | Design-complete, implementation not started |
| Platforms | macOS 13+ (primary), Windows 11, Linux (Ubuntu 22.04+) |
| Users | One Principal, one machine, one Vault |
| Network | Required only for model inference and explicit fetches |
| Out of scope | Multi-human collaboration, mobile, web app, marketplace, cloud sync |

---

## 1. Problem and opportunity

See [../00-vision/01-vision.md](../00-vision/01-vision.md) §2. In short: a solo operator's bottleneck is
organizational capacity, and no current tool supplies it. Sidra OS supplies it as a product, not a framework.

## 2. Goals and non-goals

**Goals**

- G1. Turn a stated outcome into a finished, reviewed artifact without the Principal choosing mechanisms.
- G2. Maintain a durable organizational memory that improves answers over months.
- G3. Make every result traceable to agent, model, source, cost, and authority.
- G4. Run standing processes on schedule without supervision, inside hard fences.
- G5. Feel like a world-class desktop application: fast, dense, quiet, keyboard-first.

**Non-goals for 1.0**

- N1. Autonomous action outside the fence (sending email to third parties, making payments, publishing).
- N2. Training or fine-tuning models.
- N3. Real-time voice.
- N4. Any server component or account system.
- N5. Editable org chart. The eleven roles are fixed in 1.0; customization is 2.0.

## 3. Requirements

Priority: **P0** ship-blocking, **P1** ship-desirable, **P2** deferred if late.
Each requirement carries an ID used in the traceability matrix (§8) and in the test plan.

### 3.1 Executive interaction

| ID | Priority | Requirement | Acceptance criteria |
|---|---|---|---|
| EX-01 | P0 | Principal submits a Directive in natural language from anywhere in the app | ⌘Return opens the Directive bar over any surface; submission returns a Mandate preview in <3 s |
| EX-02 | P0 | Executive produces a Mandate: objective, constraints, success criteria, budget, deadline, staffing | Mandate is schema-valid; Principal can edit any field before authorizing; "Authorize" starts execution |
| EX-03 | P0 | Executive never executes specialist work itself | Kernel rejects any tool call from `agent.exec` outside `{delegate, review, brief, decide, ask_principal}`; enforced in code, tested |
| EX-04 | P0 | Ambiguous Directives produce at most three clarifying questions before any spend | Clarify step is a distinct workflow node; questions are specific and answerable in one line each |
| EX-05 | P0 | Every Engagement ends with exactly one Brief | Brief has: Situation, Actions, Findings, Recommendation, One Ask, Cost, Confidence. ≤600 words |
| EX-06 | P1 | Principal can address any agent directly, bypassing the Executive | `@rune <text>` in the Directive bar; Executive is notified but does not gate it |
| EX-07 | P1 | Principal can interrupt a running Engagement | ⌘. halts after the current Turn, preserves state, offers Resume / Revise / Abandon |

### 3.2 Staff and delegation

| ID | Priority | Requirement | Acceptance criteria |
|---|---|---|---|
| ST-01 | P0 | Eleven agents exist per [../03-agents/03-employee-specs.md](../03-agents/03-employee-specs.md) | Each has charter, tools, memory scope, fence, KPIs loaded from versioned definition files |
| ST-02 | P0 | Work Orders are durable and typed | Persisted before dispatch; survive process kill; resumable; schema-validated |
| ST-03 | P0 | Every Deliverable is reviewed by a different agent before reaching the Executive | Author ≠ reviewer enforced by kernel; `block` verdict returns the order to the author with findings, max 2 rework cycles then escalate |
| ST-04 | P0 | Agents escalate rather than guess when blocked or out of authority | Escalation is a first-class outcome; produces Approval Request or reassignment; never a fabricated result |
| ST-05 | P1 | Parallel Work Orders execute concurrently with a configurable cap | Default 4 concurrent Turns; dependency edges respected; deadlock detection |
| ST-06 | P2 | Agents propose Playbooks after repeating a procedure three times | Suggestion appears in Night Shift digest for approval |

### 3.3 Memory and knowledge

| ID | Priority | Requirement | Acceptance criteria |
|---|---|---|---|
| MEM-01 | P0 | Five memory layers implemented per [../03-agents/05-memory-architecture.md](../03-agents/05-memory-architecture.md) | Working, Episodic, Semantic, Procedural, Canon all persisted and queryable |
| MEM-02 | P0 | Episodic log is append-only and complete | Every Turn, tool call, decision, and message is an event with a monotonic sequence and hash chain |
| MEM-03 | P0 | Semantic retrieval is hybrid | BM25 + vector, reciprocal-rank fused, recency-boosted; top-k with per-chunk provenance |
| MEM-04 | P0 | Ingestion of PDF, DOCX, MD, TXT, CSV, XLSX, PNG/JPG, and URLs | Drop into Vault or ⌘K → "Ingest"; chunked, embedded, indexed; status visible; failures explained |
| MEM-05 | P0 | Canon holds firm-level facts with provenance and confidence | Contradiction detection on write; conflict raises a Reconciliation for the Principal |
| MEM-06 | P1 | Nightly Consolidation runs | Night Shift promotes episodes → semantic/procedural/Canon, produces a digest in the Morning Brief |
| MEM-07 | P1 | Principal can correct or forget any memory | "Forget this" on any chunk/Canon entry; tombstoned, excluded from retrieval, retained in audit unless purged |

### 3.4 Engines

| ID | Priority | Requirement | Acceptance criteria |
|---|---|---|---|
| WF-01 | P0 | Durable workflow engine with resume, retry, compensation | Kill -9 at any step; on restart the Engagement continues from the last committed step |
| MT-01 | P0 | Meeting Engine supports Standup, Design Review, Decision Forum, Post-Mortem, Retrospective | Each produces Minutes with attendees, positions, dissent, outcome |
| DE-01 | P0 | Decision Engine records every material choice | Options, criteria, weights, rationale, decider, reversibility class, review date |
| DE-02 | P1 | Decisions are revisitable and supersedable | New Decision can supersede an old one with a link; Archive shows the chain |
| AU-01 | P0 | Automation Engine: schedule, event, file-watch, threshold triggers | Cron-like schedules with timezone/DST handling; all runs fenced and logged |
| NO-01 | P0 | Notification system with an attention budget | Max 3 interruptions/day by default; everything else batches into the Brief |
| LG-01 | P0 | Full trace and cost accounting per Turn, Work Order, Engagement, day, month | Cost visible live; monthly ceiling enforced with soft warn at 80% and hard stop at 100% |
| FM-01 | P0 | Vault file management with versioning | Every artifact version retained; diff between versions for text formats |

### 3.5 Interface

| ID | Priority | Requirement | Acceptance criteria |
|---|---|---|---|
| UI-01 | P0 | Shell: Rail, Sidebar, Stage, Inspector, Dock; all panels resizable and collapsible | Sizes persisted per room; drag with 8 px hit target; double-click divider resets |
| UI-02 | P0 | Rooms: Lobby, Boardroom, ten department Rooms, Archive, Vault, Console, Settings | Each reachable by ⌘1–⌘9 and ⌘K |
| UI-03 | P0 | Command Palette (⌘K) is verb-first and covers 100% of user actions | Every command in the app is invokable by keyboard; no pointer-only actions |
| UI-04 | P0 | Search Everywhere (⌘⇧F) federates Directives, Briefs, Artifacts, Decisions, Minutes, Canon, Events | Results grouped by type, ranked, previewable inline, <200 ms for local index |
| UI-05 | P0 | Dark theme, glass surfaces, motion per [../05-experience/02-design-system.md](../05-experience/02-design-system.md) | Token-driven; no hard-coded colors; `prefers-reduced-motion` respected |
| UI-06 | P0 | Live work is shown as a plan with per-step status, never an undifferentiated spinner | Progress spine with step states, elapsed, and running cost |
| UI-07 | P0 | Inspector shows provenance for any selection in one keystroke (⌘I) | Agent, model, cost, sources, authorizing decision, trace link |
| UI-08 | P1 | Full keymap per [../05-experience/06-keyboard-shortcuts.md](../05-experience/06-keyboard-shortcuts.md), remappable | Conflict detection on remap |
| UI-09 | P1 | Light theme | Same token contract; contrast verified |

### 3.6 Security and control

| ID | Priority | Requirement | Acceptance criteria |
|---|---|---|---|
| SE-01 | P0 | Vault encrypted at rest | SQLCipher + per-file encryption; key in OS keychain; optional passphrase |
| SE-02 | P0 | API keys never leave the Rust process | No key material in the webview, in logs, or in prompts; verified by test |
| SE-03 | P0 | Capability-based tool access, default-deny | Agent without an explicit grant cannot call a tool; violations logged and surfaced |
| SE-04 | P0 | Network egress allowlist | Default allow: configured model endpoints only. Any other host requires approval |
| SE-05 | P0 | Irreversible actions require explicit approval | Class-3 actions (delete outside Vault, external send, spend) always interrupt |
| SE-06 | P0 | Audit log is tamper-evident | Hash-chained; verification command reports any break |
| SE-07 | P1 | Prompt-injection defense on ingested content | Untrusted content is fenced, never granted tool authority; instruction-like text in sources is neutralized and flagged |

### 3.7 Plugins

| ID | Priority | Requirement | Acceptance criteria |
|---|---|---|---|
| PL-01 | P1 | Plugin system with manifest, declared capabilities, and sandbox | WASM component; no ambient filesystem or network; capabilities shown at install |
| PL-02 | P1 | Plugins can contribute Tools, Ingestors, Panels, Playbooks, Themes | Each extension point versioned and documented |
| PL-03 | P2 | Local plugin install from file; no marketplace in 1.0 | Signature check; revocable at any time |

## 4. Quality attributes

| Attribute | Target | Measurement |
|---|---|---|
| Cold start to interactive Lobby | ≤ 1.2 s | p95 on M1 MacBook Air |
| Directive bar open | ≤ 80 ms | p99 |
| Search Everywhere first results | ≤ 200 ms | p95, 100 k chunk index |
| Frame budget | 60 fps sustained; no frame > 32 ms during panel drag | Instrumented |
| Idle memory | ≤ 400 MB RSS | Steady state, empty stage |
| Idle CPU | ≤ 1% | No animation running |
| Crash-free sessions | ≥ 99.5% | Local counter, not reported anywhere |
| Data loss on hard kill | Zero committed records | Chaos test in CI |
| Accessibility | WCAG 2.1 AA for contrast, focus, keyboard | Automated + manual audit |

## 5. Assumptions

1. The Principal is technically literate and comfortable with keyboard-driven software.
2. At least one frontier model API key is available; local models are a 2.0 option.
3. Typical Engagement cost is $0.05–$2.00; the monthly budget default is $150.
4. Vault size in year one stays under 20 GB and 500 k chunks — well inside SQLite's comfortable range.

## 6. Risks

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Multi-agent overhead exceeds value on small tasks | High | High | Task classification: Trivial tasks bypass staffing and run one Turn (see routing doc §4) |
| Cost surprise | High | Medium | Live cost meter, per-Engagement budget in Mandate, hard monthly ceiling, cheap-model default |
| Agent theater — motion without progress | High | Medium | KPI instrumentation per agent; "value density" review in Post-Mortems; ruthless removal of ceremonial steps |
| Latency makes delegation feel worse than doing it | High | Medium | Fast lane for Trivial; streaming partials; asynchronous Engagements with notification on completion |
| Memory bloat degrades retrieval quality | Medium | High | Consolidation with decay, deduplication, Canon promotion, and periodic index rebuild |
| Prompt injection from ingested documents | High | Medium | Content fencing, capability isolation, no tool grants in reader context (SE-07) |
| Scope creep into a general agent framework | High | High | The org chart is fixed in 1.0. Non-goal N5 is enforced in review |

## 7. Release definition

**1.0 ships when:** all P0 requirements pass acceptance, quality targets in §4 are met on the reference
machine, the chaos and audit-chain tests are green, and the Principal has run the system daily for two
weeks with no data-loss or fence-violation incidents.

## 8. Traceability

| Requirement group | Architecture | Schema | Experience | Milestone |
|---|---|---|---|---|
| EX-* | 03-agents/04-ceo-protocol | `engagements`, `mandates`, `briefs` | 05-experience/04 Lobby, Directive bar | M3, M5 |
| ST-* | 03-agents/01, 06 | `agents`, `work_orders`, `deliverables`, `reviews` | Rooms, Dock | M3, M4 |
| MEM-* | 03-agents/05, 04-engines/05 | `events`, `chunks`, `canon`, `playbooks` | Archive, Canon panel | M2, M6 |
| WF/MT/DE/AU-* | 04-engines/01–04 | `workflows`, `steps`, `meetings`, `decisions`, `triggers` | Boardroom, Console | M4, M7 |
| NO/LG/FM-* | 04-engines/06–08 | `notifications`, `turns`, `artifacts` | Dock, Inspector, Vault | M5, M6 |
| UI-* | 05-experience/* | `ui_state`, `preferences` | All | M1, M5, M8 |
| SE-* | 02-architecture/07 | `capabilities`, `audit_chain` | Limits, Approval sheet | M2, M9 |
| PL-* | 02-architecture/08 | `plugins` | Settings → Extensions | M9 |

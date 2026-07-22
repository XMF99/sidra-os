# Hardening and 1.0 — Architecture

**Milestone M10 · Release 1.0 "Atrium" · the release-hardening milestone**

| | |
|---|---|
| Milestone | M10 — Hardening and 1.0 (`/MILESTONE_REGISTRY.md` §4, 1.0 "Atrium") |
| Release | 1.0 "Atrium" — the Firm exists, and now it is proven durable, secure, and bounded |
| New crate | **none** — M10 hardens existing crates and adds only to `infrastructure/ci/` and `infrastructure/testing/` |
| New migrations | **none** — M10 adds no tables (§11); hardening bookkeeping is a projection over existing events (ADR-0039) |
| Depends on | all of M1–M9 (substrate, security kernel, gateway, memory, orchestrator, full Firm, the building, plugins) |
| Status | Documented (this package) · implementation Open |
| Exit criterion | **Thirty days dogfooding, zero data loss, zero unlogged effects** (`/docs/01-implementation-plan.md` §M10; registry §4) — and 1.0 ships at the end of it |

> **Authoritative precedence.** This document consolidates and operationalizes an architecture that already
> exists across the v1 `/docs`. Where it appears to disagree with `/docs/02-testing-and-quality.md` it is
> wrong and that document governs — testing-and-quality is M10's authoritative source. Where it touches the
> durability contract, `/docs/02-system-design.md` §6 governs; the security surface, `/docs/07-security-model.md`
> governs; the performance budgets, `/docs/02-testing-and-quality.md` §6 governs; the degradation ladder,
> `/docs/01-technical-architecture.md` §9 governs. M10 *proves* these boundaries as permanent gates; it never
> re-decides them. The one thing M10 genuinely decides — that the 1.0 gate is a proof obligation and not a
> date — is ADR-0038.

---

## 1. Why this milestone exists

### 1.1 The problem

At the end of M9 the Firm is **feature-complete for 1.0**. Eleven agents, five memory layers, the six engines,
the Night Atrium shell, the plugin host, the encrypted Vault, hard Fences, and a hash-chained event log all
exist and pass their own milestone exit criteria (roadmap, 1.0 "Atrium"). Nothing new needs to be built for
the product to be whole.

And yet 1.0 cannot ship, because the three promises that make Sidra OS different from a chat window with a
database are not yet *proven under adversarial conditions*:

- **Nothing important is lost.** Every prior milestone asserted durability; none demonstrated it against a
  `kill -9` at every state transition, a corrupted page in the middle of the chain, a disk that fills mid-write,
  and a database swapped underneath a running process (testing §3).
- **Nothing effectful happens unlogged.** Each milestone added effectful paths; no milestone has proven that
  *every* one of them, across the whole 1.0 surface, has a tested log entry — that the set is closed and the
  gate that enforces it cannot be routed around (testing §1, GUIDE §7).
- **No agent exceeds its Fence, and no budget is exceeded.** M3 proved the kernel against a hostile tool; M9
  added a plugin capability surface *after* that review. The whole surface — kernel plus plugins — has never
  been red-teamed together (testing §5; impl-plan §3: "M9 must land before M10 so its capability surface is
  included in the second security review").

M10 is the milestone that converts every prior *assertion* into a *permanent, build-failing gate* and then
demonstrates the whole thing surviving thirty days of real use. It is the difference between "we believe this
is durable" and "the crash harness has killed it ten thousand times at seeded points and it recovered every
time, and CI will fail the day that stops being true."

### 1.2 The stance

M10 makes exactly one new architectural decision, and it is about the shape of the release itself:

1. **The 1.0 release gate is a proof obligation, not a date.** (ADR-0038) 1.0 ships when — and only when — the
   second security review passes with no unresolved release-blocker and thirty consecutive days of dogfooding
   demonstrate zero data loss and zero unlogged effects. Hardening introduces no product features and relaxes
   no performance budget. A budget breach is resolved by doing less work (GUIDE §3, non-negotiable 16), never
   by moving the gate.

Every other commitment in M10 is the *enforcement of a decision already recorded elsewhere*:

2. **Durability is proven, not asserted.** The crash-injection harness (testing §3) and the recovery contract
   (system-design §6) become the permanent **Chaos** CI gate (GUIDE §7).
3. **Audit coverage is a closed, enforced set.** The effect-coverage test (testing §1) becomes the permanent
   **Audit-coverage** gate: an effectful path with no log-entry assertion fails the build (GUIDE §7, §3.4).
4. **The whole surface is red-teamed once more before release.** The second of the two external security
   reviews (testing §5) covers the kernel *and* the plugin surface M9 added.
5. **Hardening bookkeeping is additive projection, not schema.** (ADR-0039) M10 adds no migration; the
   dogfood ledger, the release-gate record, and the snapshot manifest are projections over existing `system.*`
   and `decision.*` events on the existing hash chain (ADR-0002).

### 1.3 What hardening is, mechanically

Hardening is **not new code that does new things**. It is:

- **Running the existing invariants under adversarial input, as permanent gates.** The invariant list (GUIDE
  §3) already exists; M10 attaches each durability/security/boundedness invariant to a test that runs on every
  commit and fails the build on violation (GUIDE §7).
- **Closing coverage.** Enumerating every effectful tool and path in the 1.0 surface and proving each has a
  paired log assertion (testing §1); enumerating every released schema version and proving migration forward
  from each (testing §3); enumerating the five injection-defense layers and proving each holds independently
  (security §7).
- **Demonstrating.** Thirty days of the team using the product daily (GUIDE §11: "the team uses it daily from
  M6"), with an acceptance protocol that defines precisely what counts as a data-loss incident and an unlogged
  effect (§10), and a release-gate Decision demonstrated "to someone who does not trust you" (GUIDE §6).

Mechanically, M10 touches three kinds of file and no others: **tests** inside existing crates (the log-entry
assertions, the property tests), **harnesses** under `infrastructure/testing/` (chaos, red-team, performance,
backup, dogfood), and **gate definitions** under `infrastructure/ci/` (the permanent CI gates, per ADR-0031's
placement rule). No product crate gains a feature; no schema gains a table.

### 1.4 What this milestone must never become

- **A place to slip a new feature.** 1.0's scope is frozen at M9. The roadmap names what is "explicitly not in
  1.0" (multi-user, mobile, cloud sync, agent-authored code execution, third-party SaaS integration beyond a
  plugin, voice) and those stay out. A "small" feature added during hardening is a feature that was never
  security-reviewed and never dogfooded at the depth the gate assumes. If it is worth building it is M18–M20
  work (registry §4), not M10.
- **A place to raise a budget number instead of doing less work.** A cold start that regresses to 1.4 s is
  fixed by removing work from the launch path, not by editing the gate to 1.5 s. Raising a budget is possible
  only by an ADR that argues the Principal is better off (testing §6) — and "we were behind schedule" is not
  that argument (GUIDE §3, non-negotiable 16).
- **A place to waive a gate to hit a date.** ADR-0038 exists precisely to forbid this. A red gate or an open
  data-loss incident pauses the release; it does not get a calendar exception.
- **A rewrite disguised as hardening.** If a durability proof reveals that a subsystem cannot meet the
  contract, the fix is a defect fix within the existing architecture, recorded and re-proven — not a redesign.
  A redesign at M10 means the substrate was not actually finished at M2–M8, which is a finding, not a feature.

### 1.5 Relationship to existing concepts

| Existing concept | How M10 relates |
|---|---|
| Event log (M2, ADR-0002) | M10 proves the append-only hash chain survives every crash case (testing §3) and that the dogfood-window audit chain verifies from genesis with no gap; no new event kind is required for state, only additive `system.*`/`decision.*` bookkeeping (ADR-0039). |
| Permission Broker (M3) | M10 red-teams the single choke point again, now with the plugin surface attached (testing §5). It adds no bypass and no new check; it proves the existing ones hold. |
| Effect classes (M3, security §5) | M10 proves the effect-coverage gate: every class-1/2/3 path has a tested log entry (testing §1); class-3 still always asks, with no standing grant in 1.0 (security §5; GUIDE §12 permanent nos). |
| Plugin host (M9) | The plugin capability surface is inside the second security review (impl-plan §3); the hostile-plugin red-team cases (testing §5) run against it. |
| Performance budgets (M8, testing §6) | Budgets were CI gates from M1 (GUIDE §7); M10 makes them **permanent 1.0 release gates** and forbids relaxing one to ship (ADR-0038). |
| Recovery contract (system-design §6) | M10 turns the recovery routine into the Chaos gate's oracle: resume, verify, diff, and assert equivalence to an uninterrupted run of the same seed (testing §3). |
| Degradation ladder (technical-architecture §9) | M10 stages and tests the four-step ladder (full → no-network → budget-capped → read-only) as a first-class, data-loss-free path. |
| Snapshots (system-design §6) | M10 exercises backup/restore to a byte-identical Vault and a full export/re-import round-trip (impl-plan §M10). |

---

## 2. Design goals

| # | Goal | Met by |
|---|---|---|
| G1 | **Zero data loss is proven, not asserted** — under crash, corruption, and adversarial storage conditions | §6; the crash-injection harness (testing §3) + projection rebuild-and-diff (testing §1); AC1–AC3, AC6 |
| G2 | **Zero unlogged effects is a build-failing gate** — the effectful set is closed and every member has a tested log entry | §8; the Audit-coverage gate (GUIDE §7, testing §1); AC5 |
| G3 | **The whole 1.0 surface survives an adversarial review** — kernel *and* plugins, red-teamed together | §5; the second security review + injection corpus (testing §5); AC7–AC9 |
| G4 | **Performance budgets are permanent gates; breaches are fixed by doing less work** | §7; ADR-0038; testing §6, GUIDE §3.16; AC10 |
| G5 | **The Firm degrades in defined stages with no data loss** | §9; the degradation ladder (technical-architecture §9); AC12 |
| G6 | **Any Vault can be backed up and restored to byte-identical state** | §9; snapshots + export/import round-trip (system-design §6, impl-plan §M10); AC11 |
| G7 | **The release gate is a demonstrated proof obligation, not a date; hardening adds no features** | §3, §10; ADR-0038; AC15 |
| G8 | **M10 is strictly additive** — no new crate, no new authoritative table; only `infrastructure/ci/` + `infrastructure/testing/` | ADR-0039; Appendix B; §11 |
| G9 | **Every hardening claim is a permanent CI gate or a recorded Decision** — nothing rests on manual verification | §4; the eight 1.0 gates (GUIDE §7); AC4, AC14 |

---

## 3. The release-gate model — hardening as a state machine

M10 is best understood not as a list of tasks but as a gate that the release passes through. The gate has
states, transitions, and guards, exactly like an Engagement (system-design §3), and — like an Engagement — a
failure at any stage does not silently proceed.

### 3.1 States

```
   M9 exit criterion demonstrated
  ────────────────────────────────►  FEATURE_COMPLETE
                                         │  freeze 1.0 scope (roadmap "not in 1.0")
                                         ▼
                                     HARDENING ──────────────────────────────┐
                                         │  all eight 1.0 CI gates green (§4)  │ any gate red
                                         ▼                                     │ (fix by doing less work,
                                     GATES_GREEN                               │  never by raising the number)
                                         │  open the 30-day dogfood window     │
                                         ▼                                     │
                                     DOGFOODING ◄──────────────────────────────┘
                                         │  30 consecutive clean days (§10)
                                         │  AND second security review passed (§5)
                                         │  AND every open defect fixed or accepted in writing
                                         ▼
                                     GATE_EVALUATED  ← a Principal Decision, demonstrated
                                         │  to someone who does not trust the author (GUIDE §6)
                                         ▼
                                     RELEASED (1.0 ships)

   data-loss incident │ unlogged-effect found │ gate regresses │ security release-blocker
                      ▼
              DOGFOOD_RESET — the 30-day counter returns to zero; the incident is a defect
              to fix and re-prove before the window can complete (ADR-0038)
```

### 3.2 Transition table

| From | Event | To | Guard |
|---|---|---|---|
| — | `m9_demonstrated` | Feature-complete | M9 exit criterion shown live/recording to someone who does not trust the author (GUIDE §6) |
| Feature-complete | `freeze_scope` | Hardening | 1.0 scope frozen; roadmap "not in 1.0" list enforced; new-feature PRs refused |
| Hardening | `all_gates_green` | Gates-green | the eight 1.0 gates (§4) pass on `main` on the same commit |
| Gates-green | `open_window` | Dogfooding | a `system.*` dogfood-window-open marker recorded (ADR-0039) |
| Dogfooding | `clean_day` ×30 | Dogfooding→Gate-evaluated | 30 consecutive days with zero data-loss incidents and zero unlogged effects (§10) |
| Dogfooding | `incident` | Dogfood-reset | any data-loss / unlogged-effect / gate-regression / security release-blocker; counter → 0 |
| Dogfood-reset | `resolved` | Dogfooding | the incident is fixed, re-proven by its gate, and the window reopens (ADR-0038) |
| Dogfooding (30 clean) | `security_review_passed` + `defects_closed` | Gate-evaluated | second review has no unresolved release-blocker; every open defect fixed or accepted in writing (impl-plan §M10) |
| Gate-evaluated | `principal_decides` | Released | the release-gate Decision is recorded (`decision.*`) and demonstrated to someone who does not trust the author (GUIDE §6) |

### 3.3 Invariants

1. **No release from any state but `Gate-evaluated`.** 1.0 cannot ship with a red gate, an open data-loss
   incident, or an unresolved security release-blocker. The gate is a proof, not a date (ADR-0038).
2. **The dogfood window is a *consecutive* thirty days.** An incident resets the counter to zero (§3.2); the
   product does not accumulate "mostly-clean" days toward the exit criterion. Thirty clean days means thirty
   in a row (§10, registry §4).
3. **Scope is frozen at `Feature-complete` and stays frozen.** A feature added after the freeze re-opens
   Hardening from the top, because it was neither reviewed nor dogfooded (§1.4).
4. **A gate, once permanent, is never removed.** The eight 1.0 gates outlive the milestone; they run on every
   commit forever (GUIDE §7). M10 is where they become non-negotiable, not where they run once.

---

## 4. The domain of hardening — the CI gate catalogue as first-class objects

The subject matter of M10 is a set of **gates**. Each is a first-class object with an assertion, a failure
condition, and an oracle. Eight of the twelve gates in the CI catalogue (GUIDE §7) are in scope for 1.0; the
other four are introduced by later releases and are named here only to fix the boundary.

| # | Gate | Asserts | Fails the build when | M10's job | Source |
|---|---|---|---|---|---|
| GATE-1 | **Build** | The app builds and produces a *signed* installer on all three platforms | Any platform fails, or an installer is unsigned | Confirm the gate holds for the frozen 1.0 surface, plugins included | GUIDE §7; impl-plan §M1 |
| GATE-2 | **Dependency-direction** | `packages/domain ← services/* ← apps/*` (ADR-0011) | Any edge violates the direction | Prove no hardening test or harness introduces a back-edge | GUIDE §3.4/§7; DoD |
| GATE-3 | **Generated-bindings** | `packages/bindings` is generated, never hand-edited | `packages/bindings` was hand-edited | Confirm the contract test still passes under the frozen surface | GUIDE §6/§7 |
| GATE-4 | **Domain-purity** | `packages/domain` has no I/O dependency (`cargo-deny`) | `packages/domain` gained an I/O dependency | Confirm no hardening change leaks I/O into `domain` | GUIDE §7 |
| GATE-5 | **Performance** | Cold start ≤1.2 s · 60 fps sustained · idle ≤400 MB (+ secondary budgets) | Any budget regresses, on reference or lowest-spec | Make the three budgets **permanent 1.0 release gates**; a breach is fixed by doing less work (§7, ADR-0038) | testing §6; GUIDE §3.16/§7 |
| GATE-6 | **Audit-coverage** | Every effectful path has a paired log-entry assertion | An effectful path exists with no log-entry assertion | Enumerate the closed effectful set; prove 100% coverage (§8) | testing §1; GUIDE §3.4/§7 |
| GATE-7 | **Evaluation-sets** | No charter/archetype change regresses its evals; retrieval/Brief/delegation/honesty bars hold | A charter/archetype change regresses its evaluation set | Confirm all five 1.0 evaluation sets are wired as regression gates (§4.1) | testing §4; GUIDE §7 |
| GATE-8 | **Chaos** | A process killed at any state transition recovers correctly | The process is killed at a state transition and recovery fails | Turn the crash-injection harness into the permanent Chaos gate (§6) | testing §3; GUIDE §7 |

**Out of scope for 1.0 (fixing the boundary).** Four catalogue gates arrive in later releases and are *not*
M10 work: **Kernel-neutrality** (from M11 — no department identifier in a kernel crate), **Replay-equivalence**
(from M11), **Pack-validation** (from M13), and **Guard-corpus** (from M13). Naming them here prevents M10
from prematurely implementing an M11+ gate under the banner of hardening (GUIDE §7; registry §4).

### 4.1 The five evaluation sets that gate 1.0 (GATE-7 expanded)

Non-deterministic behaviour cannot be asserted equal to a string; it is measured and gated on regression, not
on an absolute bar (testing §4). M10 confirms all five are wired as permanent gates:

| Eval set | Metric | Gate |
|---|---|---|
| Retrieval | recall@10, MRR, top-result-correct over 200+ labelled pairs | Regression against the last release (not an absolute bar) |
| Brief | one-ask, claims-traceable, ≤600 words are mechanical hard tests; "answers the Directive" and "uncertainty stated" are scored by a `reasoner`-class judge with no authoring-trace access | Hard tests must pass; scored dimensions gated on regression |
| Delegation | correct staffing on 40 labelled Directives; fast lane triggers on the ones that should bypass staffing (>50%) | The labelled set is ground truth; regression fails |
| Honesty | fabrication on any "I do not know / the Vault does not contain this" Directive | **Any fabrication is a release blocker** (Principle 9 is a test) |
| Charter regression | every charter's attached evaluation set | A charter change that regresses its set does not merge |

---

## 5. The second security review

Testing §5 mandates **two external security reviews: after M3 (the kernel) and before 1.0 (the whole surface
including plugins).** M10 is the second. The reason M9 is sequenced immediately before M10 is precisely so the
plugin capability surface is inside this review (impl-plan §3; GUIDE §5 critical path).

### 5.1 Threats revisited (from security §3)

The review re-exercises every threat in the M3 model, now against the full 1.0 surface. Nothing below is a new
control; each is an existing control proven once more, with plugins attached.

| Threat (security §3) | Revisited at 1.0 |
|---|---|
| T1 prompt injection via ingested document | The injection corpus (§5.3) drives the five-layer defense; reader Turns hold zero effectful tools (security §7.3) — re-proven end to end including plugin-provided ingestors |
| T2 exfiltration through a tool | Egress allowlist + query inspection (security §7.5) re-proven, now including plugin egress; the CI test asserting the allowlist contains nothing but configured provider endpoints (security §10) holds |
| T3 key theft | Redaction on every write path; keys never in prompt/log/event/renderer (security §9); the runtime key-pattern scan runs over the dogfood window's logs and events |
| T4 Vault theft | SQLCipher at rest; auto-lock on sleep/idle; keys zeroized on lock (security §8) — re-verified as part of the crash/lock matrix |
| T5 malicious plugin | The hostile-plugin red-team (§5.2) — the M9 surface's first appearance in a security review |
| T6 silent history tampering | `audit.verify` over a fixture with a deliberately tampered row (security §11); over the full dogfood chain it must verify from genesis and name any break by sequence |
| T7 runaway spend | The three nested budget ceilings; step-count and depth caps; loop detection (security §3) — re-proven, including the parallel-Turns budget-bypass case (§5.2) |
| T8 destructive action | Effect classes; writes confined to Vault scope; class-3 always asks (security §5) |
| T9 supply chain | `cargo audit` / `cargo deny` / `npm audit` zero-known-critical; lockfiles committed; reproducible build verified per release (testing §5) |
| T10 renderer XSS via model output | Sanitizing renderer, node allowlist, no `dangerouslySetInnerHTML` (security §3) |

### 5.2 Red-team scope (testing §5)

The red-team suite runs in CI on every commit and, at minimum, mounts a hostile *tool* implementation and a
hostile *plugin* attempt across these vectors:

- path traversal out of the Vault
- symlink escape
- egress to an unlisted host
- capability escalation via a forged envelope
- log suppression
- budget bypass via parallel Turns
- keychain read
- reading another plugin's storage

**Every case must be denied *and* logged.** A silent denial fails the test, because an undetected attempt is
an intelligence failure even when the attack fails (testing §5). This is the load-bearing rule of the review:
"denied" is necessary but not sufficient — "denied and surfaced" is the contract.

### 5.3 The prompt-injection corpus (testing §5, security §11)

A growing set of documents, web pages, and file contents carrying instruction text aimed at the reading agent:
direct commands, false system prompts, encoded payloads, instructions hidden in metadata and image alt text,
and multi-hop attacks whose payload targets a *later* agent in the Engagement. The corpus is ≥60 payloads
(security §11) and assertions are **layered**, matching the five defenses (security §7):

1. content tagged `untrusted` at ingestion (provenance)
2. the structural fence survives into the frame
3. the scanner flags it (100% flag rate)
4. the capability set makes the requested action impossible regardless (zero effect-class-≥1 tool grants in an
   untrusted-context Turn)
5. egress inspection catches attempted exfiltration

**A corpus item that defeats any single layer is a finding; one that defeats all five is an incident and a
release blocker** (testing §5). This is what makes the injection defense a gate rather than a hope.

---

## 6. Chaos and recovery

The promise is **`kill -9` loses at most one in-flight model call, never committed state** (system-design §6;
testing §3). M10 proves it, and wires the proof as GATE-8 (Chaos).

### 6.1 The crash-injection harness (testing §3)

The harness runs the application under a workload and terminates it at pseudo-random points, **seeded so
failures are reproducible**. On each cycle it:

1. relaunches
2. verifies the hash chain from genesis
3. rebuilds every projection and diffs against the persisted projection
4. resumes any in-flight Engagement
5. asserts the resumed Engagement produces the **same Deliverable as an uninterrupted run of the same seed**

Step 5 is the oracle. It is not enough that the app comes back up; it must come back to the *same place* it
would have reached without the kill. "Killed at every state transition" means the Engagement, Work Order, and
Turn transition points (system-design §3): `draft→planning→executing→synthesizing→delivered`,
`queued→running→in_review→accepted`, and `prepared→…→committed`.

### 6.2 The corruption and adversarial-storage matrix (testing §3)

Beyond the seeded kills, the harness proves the additional durability cases, each with a defined correct
outcome:

| Case | Required behaviour |
|---|---|
| Disk full during a write | The write fails cleanly; no partial committed state; the Firm degrades toward read-only (§9), never corrupts |
| Vault directory read-only | Detected; the Firm enters a defined degraded state; no silent data loss |
| Database file replaced mid-run | Detected on next access; refuse rather than operate on a foreign file |
| Truncated final event | Detected; the chain is verifiable up to the last intact event; recovery resets in-flight steps (§6.3) |
| Corrupted page mid-chain | **Detected, names the first bad event, and does not silently truncate** (testing §3) |
| Clock moved backwards | Handled without breaking `seq` monotonicity or the hash chain (system-design §2) |
| System sleep during a long Turn | The Turn resumes or is reset with `attempt+1` on wake; auto-lock semantics honoured (security §8) |

### 6.3 The recovery routine (system-design §6)

On startup after an unclean shutdown, recovery is **visible, not silent** (system-design §6):

1. `integrity_check`; if it fails, refuse to open and offer the last snapshot (§9).
2. Replay: find Engagements in non-terminal states.
3. For each, reconcile step statuses: any step in `running` whose Turn has no committed result is reset to
   `queued` with `attempt+1`, unless `attempt ≥ 3`, in which case it is `escalated`.
4. Any tool call with a persisted intent but no result is re-checked for idempotency: side-effect-free tools
   re-run; **effectful tools become an Approval Request** ("this may have already happened").
5. Emit `system.recovered` with a summary; the Lobby shows what was resumed.

### 6.4 Migration rehearsal (testing §3)

Migration rehearsal is part of the durability suite: **every released schema version has a seeded fixture
database, and CI migrates all of them forward on every change to the schema.** Migrations are forward-only and
idempotent (GUIDE §3.3). Because M10 introduces no migration (§11), the rehearsal set is the M1–M9 schema
versions; M10's contribution is to make the rehearsal a permanent gate and to prove a full round-trip from the
oldest fixture forward.

---

## 7. Performance-budget enforcement

Budgets have been CI gates since M1 (GUIDE §7). M10 makes them **permanent 1.0 release gates** and fixes the
enforcement rule: **do less work; never raise the number** (GUIDE §3.16; ADR-0038).

### 7.1 The three release budgets

Each is measured on a defined reference machine **and** on the lowest-spec supported machine; **the gate is the
lower of the two** (testing §6).

| Budget | Gate | Measured by |
|---|---|---|
| Cold start to interactive Lobby | ≤1.2 s | Instrumented launch, p50 of 20 runs |
| Frame rate during an active Engagement | 60 fps sustained, no frame >32 ms | Automated trace over a 60 s scripted scenario |
| Idle resident memory | ≤400 MB | Sampled after 10 min idle |

### 7.2 The secondary budgets (also gated)

| Budget | Gate | Measured by |
|---|---|---|
| Command palette first result | ≤50 ms | Synthetic, 10k-record corpus |
| Search Everywhere first wave | ≤120 ms | Synthetic, 100k-chunk corpus |
| Retrieval p95 | ≤120 ms | Evaluation harness |
| Database write p99 | ≤8 ms | Store benchmark |

### 7.3 The enforcement rule

- **A regression fails the build and names the number** that regressed (testing §6; GUIDE §7).
- **A budget can be raised only by an ADR that argues why the Principal is better off** (testing §6). Schedule
  pressure is not that argument.
- The permitted response to a breach is a **work reduction**: kernel init is already lazy (technical-architecture
  §8: open DB, restore UI state, render Lobby from a cached Brief, warm indexes and model clients
  asynchronously); a cold-start regression is fixed by moving more work off the launch path, not by editing the
  gate. Glass is capped at three simultaneous surfaces and disabled on low-power mode (technical-architecture
  §8); a frame regression is fixed by removing a surface, not by loosening the frame budget.

---

## 8. Audit-coverage proof

The promise is **nothing effectful happens without a log entry** (testing §1). M10 makes it a closed,
build-failing gate (GATE-6).

### 8.1 The effect-coverage test (testing §1)

> Every tool marked effectful must have a paired log assertion or CI fails.

The gate works by enumeration, not sampling. Every tool in the registry declares an effect class (0–3;
security §5). Every tool of class ≥1 (external read, reversible write, irreversible/external effect) is an
effectful path and must have a test asserting the exact log entry it produces. A class-≥1 tool with no such
assertion fails the build. The set is **closed**: a new effectful tool cannot merge without its assertion,
which is what makes "zero unlogged effects" a mechanical property rather than a review outcome (GUIDE §3.4).

### 8.2 Projection equivalence (testing §1)

A companion property: **projections equal a full rebuild from events.** After every integration test, the
suite rebuilds every projection from the event log and diffs against the persisted projection; drift is a
failure (testing §1). This proves that no effect wrote state outside the log — the corollary of "the event log
is the source of truth" (system-design §2; ADR-0002). An effect that mutated a projection without a
corresponding event would surface here as a rebuild diff.

### 8.3 The dogfood-window chain (§10)

Over the thirty-day window, `audit.verify` runs nightly and on every unclean-shutdown startup (logging §1). The
acceptance criterion is that the chain verifies **from genesis with no gap** across the entire window (§10).
"Zero unlogged effects" for the exit criterion means: (a) the effect-coverage gate is green for every commit in
the window, and (b) the audit chain over the window contains an entry for every effectful action, verifiable
end to end.

---

## 9. Backup/restore and the degradation ladder

### 9.1 Backup and restore (system-design §6)

- **Snapshots** of the DB file are taken **before every migration** and **daily by the Night Shift**, retained
  **7 daily / 4 weekly**, stored in `vault/.snapshots`, and **verified by opening and running
  `integrity_check`** (system-design §6).
- **Restore** opens a snapshot, runs `integrity_check`, and — for the M10 proof — reproduces a **byte-identical
  Vault state**. The health strip surfaces the last snapshot time and the last verified restore (logging §6:
  "last snapshot 02:31 · restore verified Sunday").
- **Full export / re-import round-trip** (impl-plan §M10): the Vault is exported, the store wiped, the export
  re-imported, and the result asserted byte-identical to the original. This is the "the Vault outlives the
  software" guarantee proven mechanically.

### 9.2 The degradation ladder (technical-architecture §9)

The Firm **degrades in defined stages** — it never fails open and never loses committed work:

```
FULL ──lose network──► NO-NETWORK ──budget exhausted──► BUDGET-CAPPED ──storage read-only──► READ-ONLY
 │                        │                                │                                   │
 all subsystems          Turns queue;                     fast class only                     vault browsing,
 available               everything local                 (cheapest model)                    search, archive
                         still works                                                           (no writes)
```

| Stage | Trigger | Behaviour | Data-loss guarantee |
|---|---|---|---|
| Full | — | All subsystems available | — |
| No-network | Provider unreachable / offline | Turns queue; all local work continues (technical-architecture §9); error `E-MODEL-07` "Local work continues" (logging §7) | No committed work lost; queued Turns persist |
| Budget-capped | A budget ceiling exhausted | Only the `fast` model class runs; higher classes pause and raise one Approval Request (security §5; ADR-0020 semantics) | No work lost; the Firm continues at reduced capability |
| Read-only | Storage read-only / disk full / integrity concern | Vault browsing, search, and archive only; no writes accepted | No corruption; the Vault is readable and exportable |

Each transition is entered on its trigger and exited cleanly when the condition clears. **No stage loses
committed state**, which is the whole point of the ladder (technical-architecture §9.2: "never lose committed
work").

---

## 10. The thirty-day dogfood acceptance protocol

The exit criterion is **thirty days dogfooding, zero data loss, zero unlogged effects** (registry §4; impl-plan
§M10). This section makes each phrase objectively measurable, because an unmeasurable exit criterion is not a
gate.

### 10.1 What is measured

The team uses the product daily (GUIDE §11: "the team uses it daily from M6"; the dogfood is the same instrument
run for a bounded, recorded window). Over thirty consecutive days:

- every crash and unclean shutdown, with the recovery summary (`system.recovered`; system-design §6)
- the nightly `audit.verify` result (logging §1)
- the nightly projection rebuild-and-diff result (testing §1)
- every budget measurement and any regression (testing §6)
- every Approval Request produced by recovery ("this may have already happened"; system-design §6)
- every open defect, with a disposition: **fixed** or **explicitly accepted in writing** (impl-plan §M10)

### 10.2 What counts as **zero data loss**

Zero data loss means, across the whole window and the crash/corruption matrix (§6):

- **No committed state is ever lost.** The recovery contract permits losing at most one in-flight model call
  per kill (system-design §6); losing any *committed* Engagement, Work Order, Turn, Deliverable, Decision, or
  event is a data-loss incident.
- **Every projection rebuilds byte-identically** from the event log after every crash and every integration
  test (testing §1, §3).
- **Every snapshot restores to a byte-identical Vault**, and the export/re-import round-trip is byte-identical
  (§9.1).

A single violation is an **incident**: it resets the thirty-day counter to zero (§3.3, invariant 2) and is a
defect to fix and re-prove before the window can complete.

### 10.3 What counts as **zero unlogged effects**

Zero unlogged effects means, across the whole window:

- the **Audit-coverage gate is green on every commit** — every effectful path has its paired log assertion (§8;
  testing §1)
- the **audit chain verifies from genesis with no gap** across the entire window (logging §1)
- the **projection rebuild-and-diff shows no drift** — no effect wrote state outside the log (§8.2)

Any effectful action found without a corresponding event, or any missing log-entry assertion that reaches
`main`, is an unlogged-effect incident and resets the counter.

### 10.4 The release-gate Decision

At the end of a clean thirty-day window, with the second security review passed (§5) and every open defect
fixed or accepted in writing (§10.1), the release is a **Principal Decision**, recorded as a `decision.*` event
and **demonstrated live or in a recording to someone who does not trust the author** (GUIDE §6). "Substantially
done" is not a state (GUIDE §6). 1.0 ships at that Decision, and not before (ADR-0038).

---

## 11. Persistence and events — no new tables

### 11.1 No new migrations

M10 adds **no tables and no migration**. The migration bands are already allocated: `0001` is the v1 base;
`0002–0018` are reserved for M11–M14; `0019–0024` for M15; `0025–0029` for M16 (registry translation; M16
Implementation Plan §E8). M10 uses **none of these** and introduces no new band. A Firm at the end of M10
behaves exactly as it did at the end of M9 for every product path — hardening changes proofs, not schema
(ADR-0039).

### 11.2 What events hardening emits

M10 emits **no new domain event kind for product state.** The event kinds are namespaced and closed
(system-design §2). The facts M10 produces already have homes:

- **Recovery** → `system.recovered` (already defined, system-design §6).
- **Snapshots and restore-verification** → existing `system.*` health facts surfaced in the health strip
  (logging §6).
- **The release-gate sign-off and each defect acceptance** → `decision.*` events — they are Principal
  Decisions (GUIDE §6), not a new mechanism.

The only additive artifacts are a small set of `system.*` bookkeeping markers for the dogfood window (window
open, day recorded, incident/reset), recorded under **ADR-0039** as additive variants on the existing hash
chain (ADR-0002). The **dogfood ledger, the release-gate record, and the snapshot manifest are projections**
over these existing `system.*`/`decision.*` events — rebuildable from the log, never an authoritative table
(ADR-0002; ADR-0039).

### 11.3 The Vault Markdown mirror (v1 rule — the archive outlives the software)

M10 adds no new mirrored artifact; it *verifies* the mirror survives the export/re-import round-trip (§9.1). A
Principal who abandons Sidra OS keeps a readable record of every Decision, including the 1.0 release-gate
Decision, in plain Markdown.

---

## 12. Public commands and queries touched

M10 adds **no new Principal-facing product command.** It exercises and hardens existing operational surfaces,
and adds only CI/operational entry points (not product features):

| Surface | Kind | M10's use | Source |
|---|---|---|---|
| `audit.verify` | operational query | Nightly + unclean-shutdown startup + over the full dogfood chain | logging §1; security §11 |
| `integrity_check` | operational | On startup, before every migration, and to verify every snapshot | system-design §6 |
| snapshot / restore | operational | Backup before migration + daily; restore to byte-identical Vault (§9.1) | system-design §6 |
| diagnostic export | Principal-facing (existing) | Round-trip export/re-import; redaction re-verified (security §9) | logging §5 |
| evaluation harness | CI | The five 1.0 evaluation-set gates (§4.1) | testing §4 |
| the eight CI gates | CI | Permanent 1.0 release gates (§4) | GUIDE §7 |

**API rules preserved.** No API returns a credential (security §9); every effectful call still passes the
Permission Broker (security §4); class-3 still always asks with no standing grant in 1.0 (security §5; GUIDE §12).

---

## 13. Sequence diagrams

### 13.1 Chaos: kill-and-resume (the durability proof)

```
Harness        App(kernel)        Store           Chain/Projections
  │ launch(seed) │                  │                   │
  ├─────────────►│ run workload     │                   │
  │              ├─ Turn running ───►│ persist intent    │
  │  kill -9 (at a seeded state transition)             │
  ├──────────────X  (process gone; at most one in-flight model call lost)
  │              │                  │                   │
  │ relaunch     │                  │                   │
  ├─────────────►│ integrity_check ─►│ ok               │
  │              │ audit.verify ─────┼──────────────────►│ chain verifies from genesis
  │              │ rebuild projections ─────────────────►│ diff == persisted (byte-identical)
  │              │ replay non-terminal Engagements       │
  │              │ reset running-without-result → queued, attempt+1
  │              │ effectful tool w/ intent, no result → Approval Request
  │              │ emit system.recovered ───────────────►│ (Lobby shows what resumed)
  │              │ finish resumed Engagement             │
  │◄─ Deliverable┤                                       │
  │ assert: resumed Deliverable == uninterrupted run of same seed  ── PASS or FAIL the Chaos gate
```

### 13.2 The release-gate decision

```
Hardening        CI (8 gates)     Security Review     Dogfood Window      Principal
   │  freeze 1.0 scope │                │                   │                │
   ├──────────────────►│ all green?     │                   │                │
   │                   ├─ yes ──────────┼──────────────────►│ open 30-day window
   │                   │                │                   │  clean_day ×30 │
   │                   │                │                   │  (any incident → counter=0)
   │                   │◄─ still green every commit ─────────┤                │
   │                   │                │ review runs        │                │
   │                   │                ├─ no unresolved release-blocker ─────►│
   │                   │                │                   │ defects fixed/accepted in writing
   │                   │                │                   ├───────────────►│ evaluate gate
   │                   │                │                   │                │ Decision (decision.*)
   │                   │                │                   │                │ demonstrated to someone
   │                   │                │                   │                │ who does not trust the author
   │                   │                │                   │                ▼
   │                   │                │                   │            1.0 SHIPS
```

---

## 14. Failure scenarios

| # | Scenario | Handling |
|---|---|---|
| F1 | `kill -9` at a state transition | Recovery resumes; resumed Deliverable == uninterrupted run of the same seed, else the Chaos gate fails (§6.1; testing §3) |
| F2 | Corrupted page mid-chain | Detected; names the first bad event; does **not** silently truncate; offers the last snapshot (§6.2; system-design §6) |
| F3 | Disk full mid-write | Write fails cleanly; no partial committed state; Firm degrades toward read-only; no corruption (§6.2, §9.2) |
| F4 | Provider unreachable | Enter no-network stage; Turns queue; all local work continues; `E-MODEL-07` "Local work continues" (§9.2; logging §7) |
| F5 | Budget ceiling exhausted mid-window | Enter budget-capped stage (fast class only); one Approval Request; no work lost (§9.2; ADR-0020) |
| F6 | An effectful path merges without a log assertion | Audit-coverage gate fails the build; it cannot reach `main` (§8; GUIDE §7) |
| F7 | A performance budget regresses | Build fails and names the number; fix by doing less work, never by raising the gate (§7; ADR-0038) |
| F8 | Injection corpus item defeats all five layers | Release blocker; the window cannot complete until it is fixed and re-proven (§5.3; testing §5) |
| F9 | Red-team case denied but not logged | The red-team test fails — a silent denial is a failure (§5.2; testing §5) |
| F10 | Data-loss or unlogged-effect incident on day 22 | The thirty-day counter resets to zero; the incident is a defect to fix and re-prove (§3.3; §10.2–§10.3) |
| F11 | Snapshot fails to restore byte-identically | Backup/restore proof fails (AC11); the incident blocks the gate (§9.1) |
| F12 | A new feature is proposed during hardening | Refused; scope is frozen at Feature-complete; it is M18–M20 work (§1.4; roadmap "not in 1.0") |
| F13 | Migration rehearsal from an old fixture fails | The durability gate fails; migrations are forward-only and must carry every released version forward (§6.4; testing §3) |

---

## 15. Dependencies, assumptions, risks

### 15.1 Dependencies

| On | For |
|---|---|
| M1 — shell, signed installers, CI | the Build gate; signed installers on three platforms (impl-plan §M1) |
| M2 — Vault & event log, hash chain | the durability and audit-coverage proofs (system-design §6; testing §1) |
| M3 — security kernel, Broker, egress, keychain, effect classes | the second security review's re-exercised controls (security §3) |
| M4 — gateway & budget ceilings | the budget-capped degradation stage and T7 (security §3; §9.2) |
| M5 — memory | the retrieval evaluation set (testing §4) |
| M6/M7 — orchestrator & full Firm | the delegation/Brief/honesty evaluation sets; the daily-use instrument (testing §4; GUIDE §11) |
| M8 — the building | the three performance budgets to enforce as permanent gates (testing §6) |
| **M9 — plugins** | **the plugin capability surface must exist so the second security review covers it** (impl-plan §3; GUIDE §5) |

### 15.2 Assumptions

1. **M1–M9 are architecturally complete** (see `00-M9-AUDIT.md`). M10 hardens a finished surface; it does not
   finish an unfinished one.
2. **The team is using the product daily** and can run a bounded thirty-day dogfood window as the acceptance
   instrument (GUIDE §11).
3. **A defined reference machine and a lowest-spec supported machine exist** for the performance gates; the
   gate is the lower of the two (testing §6).
4. **The seeded crash harness is reproducible** — a failing seed can be replayed to a fix (testing §3).

### 15.3 Risks

| # | Risk | Mitigation |
|---|---|---|
| HR-1 | Hardening becomes a feature-slip window | Scope frozen at Feature-complete; new-feature PRs refused; ADR-0038 forbids it (§1.4) |
| HR-2 | A budget is raised to hit a date | Raising a budget requires an ADR arguing the Principal is better off; schedule pressure is not that argument (§7; testing §6) |
| HR-3 | The dogfood window is padded with "mostly clean" days | The window is thirty *consecutive* clean days; any incident resets the counter (§3.3; §10) |
| HR-4 | A durability proof reveals a substrate defect late | Treated as a defect fix within the existing architecture, re-proven by its gate — not a redesign (§1.4, F13) |
| HR-5 | The security review finds a plugin-surface hole M9 introduced | Exactly why M9 is sequenced before M10; the finding is a release blocker fixed before the gate (§5; impl-plan §3) |
| HR-6 | A gate is disabled "temporarily" to unblock | A permanent gate is never removed; a red gate pauses the release (§3.3 invariant 4; ADR-0038) |
| HR-7 | Effectful set drifts open as tools are added | The effect-coverage gate is by enumeration and closed; a new effectful tool cannot merge without its assertion (§8.1) |

---

## 16. Acceptance criteria

The exit criterion decomposed into objectively testable, named claims. **These are the contract with
AntiGravity.** Each maps to a task in the Implementation Plan.

| # | Claim | Proven by | Task |
|---|---|---|---|
| AC1 | `kill -9` at every state transition recovers: chain verifies from genesis, every projection rebuilds byte-identically, and the resumed Engagement produces the same Deliverable as an uninterrupted run of the same seed | seeded crash-injection harness over the transition set (§6.1; testing §3) | T2.1, T2.2 |
| AC2 | The corruption/adversarial-storage matrix is handled: disk-full, read-only Vault, DB-replaced, truncated final event, corrupted mid-page (named, not truncated), clock-backwards, sleep-mid-Turn | the durability matrix, each case asserting its required outcome (§6.2; testing §3) | T2.3 |
| AC3 | Migration rehearsal migrates every released schema version forward on every schema change; forward-only and idempotent | the migration-rehearsal gate over M1–M9 fixture DBs (§6.4; testing §3) | T2.4 |
| AC4 | Chaos is a permanent CI gate: a process killed at a state transition with failed recovery fails the build | the Chaos gate wired into `infrastructure/ci/` (§4 GATE-8; GUIDE §7) | T1.5 |
| AC5 | Zero unlogged effects: every class-≥1 path has a paired log-entry assertion; a missing assertion fails the build; the effectful set is closed | the Audit-coverage gate by enumeration (§8.1; testing §1) | T4.1, T4.2 |
| AC6 | Projection equivalence: rebuild-and-diff after every integration test is byte-identical | the projection rebuild-and-diff harness (§8.2; testing §1) | T4.3 |
| AC7 | The red-team suite denies **and logs** every case (hostile tool + hostile plugin: traversal, symlink, unlisted egress, forged-envelope escalation, log suppression, parallel-Turn budget bypass, keychain read, cross-plugin storage read); a silent denial fails | the red-team gate over the vector set (§5.2; testing §5) | T5.1, T5.2 |
| AC8 | The injection corpus (≥60 payloads) is defeated at every one of the five layers; zero effect-class-≥1 grants in untrusted-context Turns; 100% flag rate; an item defeating all five is a release blocker | the layered injection-corpus gate (§5.3; security §7/§11) | T5.3 |
| AC9 | Supply-chain gates pass: `cargo audit` / `cargo deny` / `npm audit` zero-known-critical; lockfiles committed; reproducible build verified per release | the supply-chain gate (§5.1 T9; testing §5) | T5.4 |
| AC10 | The three performance budgets are permanent release gates on reference **and** lowest-spec (gate = lower); a regression fails the build and names the number; no budget is relaxed to ship 1.0; the secondary budgets hold | the Performance gate on both machines (§7; testing §6; ADR-0038) | T3.1, T3.2, T3.3 |
| AC11 | Backup/restore proof: snapshot before every migration + daily (7 daily/4 weekly), each verified by open + `integrity_check`; restore and full export/re-import both reproduce a byte-identical Vault | the backup/restore round-trip harness (§9.1; system-design §6; impl-plan §M10) | T6.1, T6.2 |
| AC12 | The degradation ladder stages cleanly: full → no-network (Turns queue, local work continues) → budget-capped (fast class only) → read-only (browse/search/archive); no stage loses committed state | the degradation-ladder harness over each transition (§9.2; technical-architecture §9) | T6.3 |
| AC13 | All five 1.0 evaluation sets are wired as regression gates; honesty fabrication is a release blocker; Brief one-ask/traceable/≤600w are mechanical hard tests | the Evaluation-sets gate (§4.1; testing §4) | T1.6 |
| AC14 | The remaining permanent 1.0 gates hold on the frozen surface: Build (signed installers, three platforms), Dependency-direction, Generated-bindings, Domain-purity | the four gates confirmed on the frozen 1.0 commit (§4; GUIDE §7) | T1.1–T1.4 |
| AC15 | **Thirty consecutive dogfood days with zero data loss and zero unlogged effects; every open defect fixed or accepted in writing; the release-gate Decision recorded and demonstrated to someone who does not trust the author** | the dogfood acceptance harness + the release-gate Decision (§10; registry §4; GUIDE §6) — **the last thing to go green** | T7.4 |

---

## Appendix A — Glossary additions

- **Hardening** — the M10 activity of converting the durability, security, and boundedness *assertions* of
  M1–M9 into permanent, build-failing CI gates, and demonstrating the whole product surviving thirty days of
  real use. It adds no feature and relaxes no budget.
- **Release gate** — the proof obligation that 1.0 must satisfy before it ships: the eight permanent CI gates
  green, the second security review passed, and a clean thirty-day dogfood window (ADR-0038). Not a date.
- **The dogfood window** — thirty *consecutive* days of daily team use during which zero data-loss incidents
  and zero unlogged effects are recorded; any incident resets the counter to zero (§10).
- **Data-loss incident** — the loss of any *committed* state, any non-byte-identical projection rebuild, or any
  non-byte-identical snapshot/export round-trip (§10.2). Losing at most one in-flight model call per kill is
  *not* an incident (system-design §6).
- **Unlogged-effect incident** — an effectful action with no corresponding event, a missing log-entry
  assertion reaching `main`, or a projection rebuild-and-diff showing drift (§10.3).
- **Permanent gate** — a CI gate that runs on every commit forever and is never removed; M10 makes eight of
  them non-negotiable for 1.0 (§4; GUIDE §7).

## Appendix B — Repository placement

M10 changes **only** `infrastructure/ci/` and `infrastructure/testing/`, plus test additions inside existing
crates. **No new crate. No new migration.**

```
infrastructure/
├── ci/                          EXTENDED — the eight permanent 1.0 gates (ADR-0031 placement)
│   └── gates/
│       ├── build.*              GATE-1  (confirm on frozen surface)
│       ├── dependency-direction.*  GATE-2
│       ├── generated-bindings.*    GATE-3
│       ├── domain-purity.*         GATE-4
│       ├── performance.*           GATE-5  (reference + lowest-spec)
│       ├── audit-coverage.*        GATE-6  (enumeration of the effectful set)
│       ├── evaluation-sets.*       GATE-7  (the five 1.0 evals)
│       └── chaos.*                 GATE-8  (seeded crash harness as gate)
└── testing/                     EXTENDED — the hardening harnesses
    ├── chaos/                   kill-and-resume, corruption matrix, migration rehearsal (§6)
    ├── security/               red-team suite + injection corpus (§5)
    ├── performance/            the three budgets + secondary budgets (§7)
    ├── audit/                  effect-coverage + projection rebuild-and-diff (§8)
    ├── backup/                 snapshot/restore + export/import round-trip (§9.1)
    ├── degradation/           the four-stage ladder harness (§9.2)
    └── dogfood/               the thirty-day acceptance harness + release checklist (§10)

services/*  and  packages/*     EXTENDED — log-entry assertions on effectful paths (tests only; no feature)
services/store/migrations/       UNCHANGED — no new migration (§11.1)
```

Dependency direction (ADR-0011) is unchanged and re-proven by GATE-2: `packages/domain ← services/* ← apps/*`.

## Appendix C — Implementation position

M10 is the **final milestone of 1.0 "Atrium"** (registry §3; GUIDE §5). It depends on all of M1–M9 and
introduces no new product feature. Building it earlier is impossible by construction: hardening proves a
*finished* surface, and the surface is not finished until M9 lands the plugin capability the second security
review must cover (impl-plan §3; GUIDE §5 critical path). 1.0 ships at the end of M10 and is a complete product
(GUIDE §5).

**Exit criterion.** Thirty days dogfooding, zero data loss, zero unlogged effects — every claim above proven
by a permanent gate, and the release itself a demonstrated Principal Decision (AC15; ADR-0038).

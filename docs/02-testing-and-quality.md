# Testing and Quality

Sidra OS makes three promises that are unusual for a desktop application: nothing important is lost, nothing
effectful happens unlogged, and no agent exceeds its Fence. Ordinary test practice does not prove any of
those. This document describes what does.

## 1. What we are actually testing

Most of the system is not the hard part. Rendering a table, opening a room, persisting a preference — these
are covered by ordinary unit and component tests and need no special ceremony. The hard part is a small set of
invariants that must hold under adversarial conditions:

| Invariant | Why it is hard | How it is proven |
|---|---|---|
| The event chain is append-only and verifiable | Crashes, concurrent writers, partial writes | Property tests + crash-injection harness (§3) |
| Projections equal a full rebuild from events | Drift accumulates silently | Rebuild-and-diff assertion after every integration test |
| No effect occurs without a log entry | Easy to add a code path that forgets | Effect-coverage test: every tool marked effectful must have a paired log assertion or CI fails |
| No agent exceeds its Fence | Fences are enforced in one place but requested from many | Red-team suite (§5) |
| Budgets are never exceeded | Estimation is approximate; enforcement must not be | Ceiling tests with adversarial token counts |
| Untrusted content cannot issue instructions | Injection is an open research problem | Injection corpus + layered defence assertions (§5) |
| Retrieval returns the right things | Quality, not correctness | Evaluation sets (§4) |

## 2. The test pyramid, weighted for this system

- **Unit (Rust, ~60% of test count).** Domain types, state machines, the routing table, budget arithmetic,
  hash chaining, scheduling and DST arithmetic. Fast, deterministic, no I/O.
- **Property-based (proptest).** Anywhere an invariant can be stated: chain verification over arbitrary event
  sequences, workflow DAG compilation over arbitrary graphs (a compiled workflow is always acyclic and every
  step reachable), retry logic over arbitrary failure sequences, and merge behaviour for concurrent memory
  writes.
- **Integration (Rust, in-process, real SQLite).** Store, memory, orchestrator, and gateway together with a
  **fake model provider** that replays recorded responses and can be told to fail in every way the failure
  ladder anticipates. No real network in CI, ever.
- **Contract (renderer ↔ kernel).** The IPC surface is generated from one source of truth; the contract test
  asserts that every command has a schema, every schema has a test fixture, and no command exists that the
  renderer cannot call or the kernel does not implement.
- **Component (renderer, Vitest + Testing Library).** Every one of the 48 components against its states
  checklist: default, hover, focus, active, disabled, loading, empty, error, and reduced-motion.
- **End-to-end (WebDriver against the packaged app, on all three platforms).** The primary journeys only —
  first run, a Directive to Brief, an Approval Request, an automation firing, a Vault lock/unlock. E2E tests
  are expensive and flaky by nature, so there are few of them and each one earns its place.
- **Evaluation (non-deterministic, §4).** Scored, tracked over time, gated on regression rather than absolute
  pass/fail.

## 3. Durability and crash testing

The promise is: **`kill -9` loses at most one in-flight model call.** It is tested, not asserted.

A crash harness runs the application under a workload and terminates it at pseudo-random points, seeded so
failures are reproducible. On each cycle it: relaunches, verifies the hash chain from genesis, rebuilds every
projection and diffs against the persisted projection, resumes any in-flight Engagement, and asserts that the
resumed Engagement produces the same Deliverable as an uninterrupted run of the same seed.

Additional durability cases: disk full during a write; the Vault directory becoming read-only; the database
file replaced mid-run; a truncated final event; a corrupted page in the middle of the chain (must be detected,
must name the first bad event, must not silently truncate); clock moved backwards; and system sleep during a
long Turn.

Migration rehearsal is part of this suite: every released schema version has a seeded fixture database, and CI
migrates all of them forward on every change to the schema.

## 4. Evaluating non-deterministic behaviour

Model output cannot be asserted equal to a string. It can be measured.

**Retrieval evaluation.** 200+ labelled query/document pairs drawn from real Vault content. Metrics:
recall@10, MRR, and the fraction of queries where the top result is correct. Gated on regression against the
last release, not on an absolute bar.

**Brief evaluation.** A rubric applied by both a human reviewer and an independent `reasoner`-class judge with
no access to the authoring trace: Does the Brief answer the Directive? Is there exactly one ask? Are claims
traceable to Deliverables? Is uncertainty stated where the trace shows uncertainty? Is it under 600 words?
The last three are mechanically checkable and are enforced as hard tests; the first two are scored.

**Delegation evaluation.** For a fixed set of 40 Directives with known correct staffing, does Kai assign the
right agents, and does the fast lane trigger on the ones that should bypass staffing (target: >50%, with the
labelled set defining ground truth)? Wrong staffing is cheap to detect and expensive to leave in.

**Honesty evaluation.** A set of Directives whose correct answer is "I do not know" or "the Vault does not
contain this." Fabrication on any of them is a release blocker, not a score. Principle 9 is a test.

**Charter regression.** Every agent charter has an attached evaluation set. Changing a charter runs it. A
charter change that improves one agent and regresses another is surfaced as such.

## 5. Security testing

**Red-team suite** (runs in CI, every commit): a hostile tool implementation and a hostile plugin attempt, at
minimum — path traversal out of the Vault, symlink escape, egress to an unlisted host, capability escalation
via a forged envelope, log suppression, budget bypass via parallel Turns, keychain read, and reading another
plugin's storage. Every case must be denied *and* logged; a silent denial fails the test, because an
undetected attempt is an intelligence failure even when the attack fails.

**Prompt-injection corpus**: a growing set of documents, web pages, and file contents containing instruction
text aimed at the agent reading them — direct commands, false system prompts, encoded payloads, instructions
hidden in metadata and in image alt text, and multi-hop attacks where the payload targets a *later* agent in
the Engagement. Assertions are layered: the content is tagged `untrusted` at ingestion; the structural fence
survives into the frame; the scanner flags it; the capability set makes the requested action impossible
regardless; and egress inspection catches exfiltration. A corpus item that defeats any single layer is a
finding; one that defeats all five is an incident and a release blocker.

**Dependency and supply chain**: `cargo audit` and `cargo deny` on every build, `npm audit` with a zero-known-
critical policy, lockfiles committed, and reproducible builds verified per release.

Two external security reviews: after M3 (the kernel) and before 1.0 (the whole surface including plugins).

## 6. Performance testing

Budgets are CI gates from M1. Each is measured on a defined reference machine and on the lowest-spec supported
machine; the gate is the lower of the two.

| Budget | Gate | Measured by |
|---|---|---|
| Cold start to interactive Lobby | ≤1.2 s | Instrumented launch, p50 of 20 runs |
| Frame rate during an active Engagement | 60 fps sustained, no frame >32 ms | Automated trace over a 60 s scripted scenario |
| Idle resident memory | ≤400 MB | Sampled after 10 min idle |
| Command palette first result | ≤50 ms | Synthetic, 10k-record corpus |
| Search Everywhere first wave | ≤120 ms | Synthetic, 100k-chunk corpus |
| Retrieval p95 | ≤120 ms | Evaluation harness |
| Database write p99 | ≤8 ms | Store benchmark |

Regressions fail the build and name the number. A budget can be raised only by an ADR that argues why the
Principal is better off.

## 7. Accessibility and platform QA

Automated axe checks on every route; manual keyboard-only walkthrough of every primary journey at M8 and
before each release; VoiceOver and NVDA passes on the shell and the Brief view; contrast verified from the
token contract mechanically, so a new token that fails AA cannot merge; reduced-motion parity asserted
per-component (every animated affordance has a static equivalent conveying the same information); and type
scale tested at 90% and 130% for layout integrity.

Visual regression snapshots run per platform, because the OS webview is the platform-specific risk this
architecture accepts.

## 8. Definition of done

A change is done when: it has tests at the appropriate level; effectful paths assert their log entries; new
components meet the states checklist in both themes; performance gates pass; documentation in `/docs` is
updated in the same change if behaviour described there changed; and any architectural decision it embodies is
recorded as an ADR. Documentation drift is treated as a defect of the same severity as a broken test, because
in a system this size the documentation is the interface between the people building it.

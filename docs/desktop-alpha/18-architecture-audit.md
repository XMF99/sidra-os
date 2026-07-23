# Deliverable 10 — Architecture Audit

A self-audit of **this package's design** against the platform's non-negotiables,
in the same evidence-first spirit as the M1–M30 audits in the project. It has two
uses: (1) prove the *design* is compliant before implementation; (2) serve as the
**green-before-done** checklist the implemented shell must pass at the end of
Sprint 1 (`16 G5`).

Two verdict columns: **Design verdict** (is the spec compliant?) and **Impl
gate** (what the built code must show to pass). "Evidence" points at the spec
section or the runtime check.

---

## 1. Invariant compliance

| Invariant | Design verdict | Impl gate (must be shown) | Evidence |
|---|---|---|---|
| Event Log = single source of truth (ADR-0002) | **Compliant** — UI reads projections, writes via events, owns no truth | No UI store holds domain data; every write produces an event; UI reconstructable from log | `01 §1,§3,§4`, `08`, A1/A3 |
| Permission Broker = only choke point, default-deny (ADR-0006) | **Compliant** — UI checks are affordance only; every command re-checks server-side | Grep: every command handler calls broker; UI has no authorization branch that skips it | `01 §5`, ADR-0085, A2 |
| Dependency direction `domain ← services ← apps` (ADR-0011) | **Compliant** — UI's sole inbound edge is IPC; no upward reach | No import from `services/*` in `apps/desktop/src`; no `services→apps` edge | `01` App. A §2, `12`, A8 |
| Domain purity | **Compliant** — renderer uses DTOs, never domain types | Renderer imports only `packages/bindings` DTOs | `01 §6.3`, ADR-0081 |
| Kernel neutrality | **Compliant** — domain cards are generic; dept content is data | No department name branched in a shell/component; only data-driven rendering | `01` App. A §3, `07 §3` |
| Replay integrity / append-only (M11, ADR-0002) | **Compliant** — Event Log & Replay read-only; replay = driver output | No edit/delete/reorder affordance; replay does not fold events | ADR-0086, `05 §7`, `03 §10`, A5 |
| Separation of duties (ADR-0008/0018/0060/0076) | **Compliant** — author-never-approves-own enforced server-side, predicted in UI | Approve disabled+reason for author; server denies author approval | `05 §8`, G2 |
| Propose-never-enact (structure) (ADR-0076) | **Compliant** — Organization is propose-only; enactment needs a Principal Decision | No UI path enacts a structure change without a Decision | `03 §3`, C3 |
| No telemetry (ADR-0009) | **Compliant** — zero analytics; local-only | No network call except connector egress + signed update | `01 §10`, `01` App. A §5, A6 |
| Credential custody (ADR-0034) | **Compliant** — secrets never cross IPC to renderer | Inspection: no credential field in any DTO the renderer receives | `03 §8`, `01 §10`, A7 |
| Workspace boundary | **Compliant** — additions confined to `apps/desktop/` | Diff: no change outside `apps/desktop/`; no migration/member/gate edit | `12`, A3 |

---

## 2. Anti-pattern sweep (the failure modes the prior audits found — pre-empted)

The M1–M30 audits catalogued specific ways this codebase drifted from its
architecture. This design explicitly forecloses the UI-plane analogues:

| Prior failure (audit) | UI-plane analogue this design forbids | Guard |
|---|---|---|
| Event log bypassed (in-memory Vault, mission `Vec`) — F5/F7 | UI keeping an authoritative client store, or optimistic state that never reconciles | ADR-0081/0083; A1; command machine (`15 §2`) reconciles on tail |
| Fake sandbox presented as real — F4 | UI presenting client-side permission checks *as* enforcement | ADR-0085; A2 — enforcement stays server-side |
| Client-side replay that could diverge | UI folding events into state / re-ranking memory as the answer | ADR-0086; C7; A5 |
| Dead/skipped code paths (migrations, gates) silently green | Degraded read models silently shown as real data | `01 §9`; F3 — degraded state is *labeled*, follow-up filed, never faked |
| Registry claimed "Implemented" beyond evidence | This package claiming a page "done" without its acceptance demo | `16` requires demonstration; `17` gates on it |
| Layering inversion (`store` depends up) — F8 | Components importing IPC / services directly | `07 §5`; `12` rules; A8 |

---

## 3. Residual design risks (carried to `19`)

The design is compliant **given** the assumptions Epic 0 must verify. The audit
flags three dependencies that, if unmet, move a row above from Compliant to
At-risk until resolved:

1. **IPC read-model coverage.** Several pages assume read models that may be
   PARTIAL/MISSING (notably Projects aggregate, `analytics.dailySummary`,
   `missions.replay`, `permissions.forActor`, `events.tail`). Unmet → those
   surfaces ship degraded, not fake. Tracked in `19` R1 and `20`.
2. **Event tail existence.** If no tail exists, freshness falls to interval
   polling (still compliant, less live). `19` R2.
3. **Permission annotation availability.** If the broker can't answer read-only
   capability queries cheaply, affordance states collapse to
   "explain-on-attempt" everywhere (still compliant, worse UX). `19` R3.

None of these is a compliance violation — each degrades safely — but each is a UX
ceiling until the backend follow-up lands.

---

## 4. Audit verdict

**Design verdict: PASS.** The Desktop Alpha Sprint 1 architecture is compliant
with every non-negotiable and every relevant ADR, and it pre-empts the specific
failure modes the M1–M30 audits identified. It introduces no architectural
breaking change.

**Impl gate:** the built shell passes this audit when every "Impl gate" cell in
§1 is demonstrably true and the `16` acceptance criteria (esp. A1–A8, G1–G5) are
green. Until then Sprint 1 is *scaffolded, not done* — the same distinction the
prior audits drew for the platform.

# M23 Kernel Extraction — Review Checklist

**Gate before handoff to AntiGravity.** This confirms the architecture package is complete, internally
consistent, and ready to implement. It is a checklist for the architect (self-review) and the Principal
(approval), not for the implementer.

---

## 1. Documents complete

- [x] Architecture document — `KERNEL_EXTRACTION_ARCHITECTURE.md` (why it exists, design goals, kernel-server
      lifecycle, domain model, client-session state machine, repository BEFORE/AFTER, security, transport
      mechanism, authentication, the preserved surface, events, persistence, public APIs, performance,
      sequence diagrams, failure scenarios, dependencies, risks, acceptance criteria, testing, CI, appendices)
- [x] Implementation plan — `IMPLEMENTATION_PLAN.md` (E1–E6, tasks with complexity, deps, files, AC, order)
- [x] Review checklist — this document
- [x] M22 audit (STEP 1 gate) — `00-M22-AUDIT.md`
- [x] Delivery index — `README.md`

## 2. ADRs complete

- [x] ADR-0062 — The kernel is extracted as a hosted process behind a new `apps/` binary, with the transport
      as the only change (no file moved, no import rewritten)
- [x] ADR-0063 — The client↔kernel transport is a typed RPC preserving the existing command/query surface and
      the Broker choke point

Each follows the repo format (Context → Options → Decision → Consequences, with accepted / gained / reversal
cost). Numbering is consecutive from ADR-0062 and does not exceed ADR-0063. Both are `Proposed`.

- [ ] **Integration action (AntiGravity):** copy the two ADRs into `docs-v2/adr/`, add their rows to
      `docs-v2/adr/README.md`, and mark them `Accepted` on Principal approval.

## 3. Dependencies verified

- [x] M11 (kernel-as-library / department substrate) — Documented; the process-agnostic kernel `kernel-server`
      hosts
- [x] M21 (Seats) — Defined; the Seat-identity contract M23 authenticates against is fixed by ADR-0021
      (Accepted). See `00-M22-AUDIT.md` §2 for why architecting against a Defined M21 is safe
- [x] ADR-0011 (seven-directory monorepo) — the dependency direction that makes the extraction additive
- [x] ADR-0001 (Rust core reusable as a server) — the premise `apps/kernel-server` collects on
- [x] M2 / ADR-0002 (event log & audit chain) — the single history headless and in-process kernels share
- [x] Dependency direction preserved: `packages/domain ← services/* ← apps/*`; both `apps/desktop` and
      `apps/kernel-server` at the `apps/*` layer; **no** `apps → apps` edge; **no** new edge into `services/*`
      (CI-enforced, AC-K1)

## 4. Consistency with authoritative sources

- [x] The renderer-boundary rules (`/docs/01-technical-architecture.md` §4) transfer verbatim to every
      transport client: no secrets/fs/net, generated bindings, treated-as-compromised (architecture §7.1)
- [x] The Permission Broker remains the single choke point (`/docs/07-security-model.md` §4); the transport
      authenticates but never authorizes an action and grants no ambient authority (ADR-0063; architecture
      §7.2, §9)
- [x] The event bus (`/docs/02-system-design.md` §2) is unchanged; events stream over the transport with a
      `since_seq` cursor and the existing backpressure rule
- [x] The command/query surface is byte-for-byte the same generated bindings (`/docs/01-technical-architecture.md`
      §4 rule 3); no second command surface (architecture §10)
- [x] Consistent with ADR-0011's stated payoff ("no file moved, no import rewritten") and ADR-0001's "the same
      crate becomes the 3.0 server binary"
- [x] Seat identity per ADR-0021 ("every event carries a Seat ID"); every command attributed to a Seat
- [x] Milestone numbering per `/MILESTONE_REGISTRY.md` (M23, 3.0 "Chambers"; depends on M11, M21)
- [x] No existing architecture modified; no ADR decision reversed; no documentation duplicated

## 5. Acceptance criteria complete

- [x] AC-K1–AC-K12 defined in the architecture §18 and each mapped to a task in E6 (and its producing epic)
- [x] The exit criterion ("the kernel runs headless; the desktop is one client; no file moved, no import
      rewritten") is decomposed into AC-K1 (no source move), AC-K2 (headless), AC-K3 (desktop as one client),
      AC-K5 (Broker still the only choke point), and AC-K9 (a second client connects)
- [x] AC-K1 (no file moved, no import rewritten) is owned by task T6.7 and is **the last thing to go green**
- [x] Every AC is testable and named; none relies on configuration or manual verification — the headline claim
      is a CI gate, not an assertion

## 6. Scope discipline — topology, not reorganisation

- [x] No production code in this package (architecture and plan only)
- [x] **The extraction is topology/packaging, not a source reorganisation:** no `server/`/`client/` roots, no
      `shared/` crate carved out of `packages/domain`, no split command registry (architecture §1.4; ADR-0062
      rejects reorganisation explicitly)
- [x] **No change to the command/query surface shape:** the transport carries the existing generated bindings;
      a schema-diff test asserts they are byte-identical (AC-K7)
- [x] `services/*` and `packages/{domain,bindings}` are unchanged; the additions are `apps/kernel-server`,
      `packages/transport`, tests, and the CI check; the one change is the desktop's `ipc.rs` dispatch
- [x] The Companion and additional remote Seats are out of scope as *clients* (Companion is M18); M23 delivers
      the topology and one desktop client, plus the second-client proof
- [x] Non-TLS remote transports flagged out of scope (would need their own ADR)

## 7. Open items carried forward (non-blocking for architecture; blocking for implementation)

- [ ] **M21 and M22 must be Documented, implemented, and integrated before M23 is implemented.** M23's
      transport authenticates against Seat identities M21 creates and must preserve M22's no-self-approval
      rule. This is stricter than the ordinary STOP because two upstream milestones sit between the documented
      frontier and M23 (see `00-M22-AUDIT.md` §4). **Hard blocker for implementation.**
- [ ] Migration `0049_` assumes M17–M22 consume `0030–0048`; the integrator renumbers to the next free slot if
      they land differently — a mechanical fix (see `00-M22-AUDIT.md` §5).
- [ ] ADR-0062/0063 promotion `Proposed → Accepted` on Principal approval — does not gate M23 architecture.
- [ ] On integration, update `/MILESTONE_REGISTRY.md` M23 status `Defined → Documented` (renumbering becomes
      forbidden at that point, per registry rule 4).
- [ ] The folder-structure note (`/docs/03-folder-structure.md` §1.1, "things a person launches") is updated to
      admit a headless deployable in `apps/` (ADR-0062 accepts this strain).

## 8. Ready for AntiGravity

- [x] Documents complete
- [x] ADRs complete
- [x] Dependencies verified
- [x] Acceptance criteria complete
- [x] **Ready for implementation — subject to the STOP.** Recommended start: E1 → E2, then E3, then E4. E6 (the
      acceptance) is the last thing to go green, and its final task T6.7 (no file moved, no import rewritten)
      is the last thing green in the milestone.

**STOP.** Per the workflow, do not begin M24 until AntiGravity completes M23 implementation and integration,
**and** the headless-kernel / no-file-moved exit criterion is demonstrated. And do not *begin* M23
implementation until M21 and M22 are Documented, implemented, and integrated (§7).

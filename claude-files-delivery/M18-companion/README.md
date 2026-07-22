# M18 — Companion · Delivery Package

**For AntiGravity.** The complete architecture package for milestone M18 (Companion), release 2.5 "Field".
Architecture and specification only — **no production code**, per the workflow.

## What this milestone delivers

A mobile surface — a phone — that **reads Briefs and acts on Approval Requests, and nothing else**. It ships a
Layer-1 kernel service (`sidra-companion`) that pairs devices, pushes a bounded snapshot of the day's Briefs
and pending approvals, and reconciles phone-captured approvals onto the hash chain; and an untrusted mobile
client (`apps/companion`) that displays a Brief and captures an approval. It ships **no** authoring: no
Directive creation, no composition, no editing.

**Exit criterion:** a Principal clears a day's approvals from a phone **with no desktop present**, and the
Brief renders **identically** — proven by test, not by configuration.

## The one hard problem, and how it is solved

The exit criterion says "no desktop present," yet Kernel Extraction is **M23**, five milestones away. M18 may
not presuppose a headless hosted kernel, and ADR-0009 forbids a cloud service. **ADR-0049** resolves this: a
**local-first cache** (the desktop pushes the day's Briefs + pending approvals while online) plus an
**append-only outbox** (the Principal captures approvals offline, each keyed to its `approval_request.id`)
plus **idempotent reconciliation** (the kernel appends the Decision to the hash chain when it next runs —
applying an entry twice is a no-op). The phone is a courier; the kernel stays the single source of truth; the
optional relay is dumb and on the Principal's own infrastructure. This is the load-bearing decision of the
milestone.

## Contents

| File | What it is |
|---|---|
| `00-M17-AUDIT.md` | STEP 1 gate: M17 is `Defined`, but M18 depends on M10 + M15, not M17 — so no gap blocks M18 |
| `COMPANION_ARCHITECTURE.md` | The architecture — the authority on behaviour |
| `adr/0049-no-desktop-present-sync-and-idempotent-reconciliation.md` | The load-bearing decision: local-first cache + outbox + idempotent reconciliation, no M23, no cloud |
| `adr/0050-companion-is-a-paired-untrusted-client.md` | The phone as a paired, untrusted client; device keypair; revocable trust |
| `adr/0051-brief-travels-as-a-canonical-render-payload.md` | The Brief renders once in the kernel; the phone displays verbatim; no authoring |
| `IMPLEMENTATION_PLAN.md` | E1–E6, tasks with complexity, dependencies, files, acceptance criteria, order |
| `REVIEW_CHECKLIST.md` | The gate confirming the package is complete and ready |

## The three decisions, in one line each

1. **No-desktop-present sync (0049):** a local-first cache + append-only outbox + idempotent reconciliation
   keyed to `approval_request.id`; needs neither a headless kernel (M23) nor a cloud service.
2. **Paired, untrusted client (0050):** the phone holds no secret and no Vault; pairing is a logged Decision
   binding a device keypair; a lost phone is revoked with one Decision, structurally, without history rewrite.
3. **Canonical render payload (0051):** the kernel renders the Brief once into a hashed, allowlisted node tree;
   the phone paints it verbatim ("renders identically" is a hash equality) and has no engine to author from.

## Reading order

1. `00-M17-AUDIT.md` — why it was safe to start M18 while M17 is only Defined
2. `COMPANION_ARCHITECTURE.md` — §1 for the stance, §3–§4 for the model, §8–§9 for render + reconciliation
3. The three ADRs — the load-bearing decisions (0049 first)
4. `IMPLEMENTATION_PLAN.md` — what to build, in order
5. `REVIEW_CHECKLIST.md` — confirm ready before starting

## Integration notes for AntiGravity

- Copy the three ADRs to `docs-v2/adr/`, add rows to `docs-v2/adr/README.md`, mark `Accepted` on approval.
- Migrations begin at `0033_` (connector framework ends at `0029`; `0030`–`0032` reserved for M17 — confirm
  before finalizing).
- On completion, update `MILESTONE_REGISTRY.md` M18 status `Defined → Documented`; the number is permanent
  from that point (registry rule 4).
- Dependency direction is CI-enforced: `sidra-companion` must not import `sidra-orchestrator`,
  `sidra-mission`, or `sidra-departments`.
- CI adds the six §19 checks, including `companion-no-authoring` and `companion-no-secret`.

**Then STOP.** Do not begin M19 until M18 is implemented, integrated, and the phone-clears-approvals-with-no-
desktop exit criterion is demonstrated.

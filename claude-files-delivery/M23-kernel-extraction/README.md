# M23 — Kernel Extraction · Delivery Package

**For AntiGravity.** The complete architecture package for milestone M23 (Kernel Extraction), release 3.0
"Chambers". Architecture and specification only — **no production code**, per the workflow.

## What this milestone delivers

The 3.0 topology. The existing trusted Rust kernel (`services/*` + `packages/*`) runs **headless as a hosted
process** behind a **new binary under `apps/`** (`apps/kernel-server`), and the desktop app becomes **one
client** among potentially many (desktop today; Companion and additional Seats later). It ships a typed RPC
transport that carries the *same* command/query/event surface over a network/local-socket boundary, and the
per-client (Seat) authentication that multi-client identity needs.

It is a **topology and packaging change, not a source reorganisation.** The headline deliverable is that
**nothing in the source tree had to change** — the extraction was designed in from M1 by ADR-0011 (the
seven-directory monorepo) and ADR-0001 (a Rust core reusable verbatim as a server). M23 collects that debt.

**Exit criterion:** the kernel runs headless; the desktop app becomes one client; **no file moved, no import
rewritten** — proven by a diff/CI assertion that `services/*` and `packages/*` are unchanged and only an
`apps/` binary plus a transport were added, that the Broker remains the only choke point, and that a second
client connects distinguished on the chain.

## Contents

| File | What it is |
|---|---|
| `00-M22-AUDIT.md` | STEP 1 gate: M22 is a sibling, not a dependency; M23's real dependencies (M11 Documented, M21's Seat-identity contract fixed by ADR-0021) are sound; the STOP is the binding constraint |
| `KERNEL_EXTRACTION_ARCHITECTURE.md` | The architecture — the authority on behaviour |
| `adr/0062-kernel-extracted-as-a-hosted-process-behind-a-new-apps-binary.md` | The kernel is extracted behind a new `apps/` binary; the transport is the only change |
| `adr/0063-client-kernel-transport-is-a-typed-rpc-preserving-the-command-query-surface.md` | The transport is a typed RPC preserving the surface and the Broker choke point |
| `IMPLEMENTATION_PLAN.md` | E1–E6, tasks with complexity, dependencies, files, acceptance criteria, order |
| `REVIEW_CHECKLIST.md` | The gate confirming the package is complete and ready |

## The two decisions, in one line each

1. **Extraction (0062):** add a headless `apps/kernel-server` that hosts the *same* Kernel; change `services/*`
   and `packages/*` by nothing; change only the desktop's dispatch. No file moved, no import rewritten.
2. **Transport (0063):** a typed RPC that carries the *existing* command/query/event surface over the wire,
   authenticates each client as a Seat, and hands every command to the *same* Broker choke point — no second
   surface, no second choke point, no ambient authority.

## Reading order

1. `00-M22-AUDIT.md` — why it was safe to architect M23 now, and the STOP that gates its implementation
2. `KERNEL_EXTRACTION_ARCHITECTURE.md` — §1–§6 for the stance, model, and the BEFORE/AFTER proof, then the ADRs
3. The two ADRs — the load-bearing decisions
4. `IMPLEMENTATION_PLAN.md` — what to build, in order
5. `REVIEW_CHECKLIST.md` — confirm ready before starting

## Integration notes for AntiGravity

- Copy the two ADRs to `docs-v2/adr/`, add rows to `docs-v2/adr/README.md`, mark `Accepted` on approval.
- The one migration begins at `0049_` (M16 used 0025–0029; M17–M22 are expected to consume through 0048).
  Renumber to the next free slot if they land differently.
- Dependency direction is CI-enforced: `apps/kernel-server` depends only downward; **no** `apps → apps` edge
  and **no** new edge into `services/*`. The "no source move" check must be green from the first task.
- On completion, update `/MILESTONE_REGISTRY.md` M23 status `Defined → Documented`; the number is permanent
  from that point (registry rule 4). Update `/docs/03-folder-structure.md` §1.1 to admit a headless deployable
  in `apps/`.
- The exit criterion is a CI gate (AC-K1), not an assertion: the milestone's headline claim is a green check
  on a diff a reviewer can read in one sitting.

**Do not begin M23 implementation** until M21 (Seats) and M22 (Separation of Duties) are Documented,
implemented, and integrated — the transport authenticates against Seat identities M21 creates and must
preserve M22's no-self-approval rule (`00-M22-AUDIT.md` §4).

**STOP — do not begin M24 until M23 is implemented, integrated, and the headless-kernel / no-file-moved exit
criterion is demonstrated.**

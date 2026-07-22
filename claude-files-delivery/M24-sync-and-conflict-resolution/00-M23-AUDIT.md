# M23 Architecture Audit — gate before M24

**Purpose.** STEP 1 of the workflow: before architecting the next milestone, verify the previous one is
architecturally coherent as a dependency and report any gap. This audit gates M24 (Sync and Conflict
Resolution).

| | |
|---|---|
| Milestone audited | M23 — Kernel Extraction |
| Registry status | **Defined** (architecture not yet written; `/MILESTONE_REGISTRY.md` §4) |
| Audit verdict | **Coherent as a dependency. No gap blocks M24's architecture.** M23 must be *architected and implemented* before M24 is *implemented* — see §3. |
| Authoritative sources | `/MILESTONE_REGISTRY.md` §4, `/docs/09-scalability.md` §2 (kernel-as-library), `/docs/02-system-design.md` §9, ADR-0011 (crate boundaries) |

---

## 1. What M24 actually requires of M23

M24 depends on M23 for exactly one thing: **a topology in which more than one client holds the Vault.** The
registry defines M23 as "the kernel runs headless; the desktop app becomes one client; no file moved, no
import rewritten" (`/MILESTONE_REGISTRY.md` §4, M23). That is precisely the precondition sync needs — without
a kernel that runs as a hosted process addressable by more than one client, there is one embedded process and
nothing to converge.

Crucially, M24's *architecture* (this package) does not depend on M23's *architecture document* existing yet.
M24 architects against the **substrate M23 exposes** — a hosted kernel with authenticated clients — which the
scalability doc already committed to in 1.0:

| Substrate M24 builds on | Where it is already decided | M23's role |
|---|---|---|
| Kernel is a library, not app logic (`sidra-kernel` has no Tauri dependency) | `/docs/09-scalability.md` §2, ADR-0011 | M23 makes the same crate the hosted binary, unchanged |
| Command/query separation; commands become endpoints 1:1 | `/docs/09-scalability.md` §2, `/docs/02-system-design.md` §1 | M23 exposes the commands over the client boundary |
| Event log as the replication stream, "CRDT-free sync basis" | `/docs/09-scalability.md` §2, §4 | M23 provides the process; M24 provides the sync |
| No renderer-authoritative state; a client is another projection | `/docs/09-scalability.md` §2 | M23's desktop-app-as-client is that projection |

Every one of these was a deliberate 1.0 decision "so that the enterprise product is an extension rather than a
rewrite" (`/docs/09-scalability.md` §7). M24 draws on them directly; M23 is the milestone that turns the
library into a hosted process, and M24 assumes only that outcome, not any particular internal design of it.

## 2. Discrepancies noted (non-blocking)

Per the standing rule "if registry metadata appears stale or a dependency is merely Defined, note it and
continue":

1. **M23 is `Defined`, not `Documented`.** Its architecture document has not been written
   (`/MILESTONE_REGISTRY.md` §1 header: "M17–M30 defined, not yet documented"). This is expected — M24 is being
   architected ahead of M23's document, which is permitted because M24's architecture depends on M23's *exit
   criterion and substrate* (both fixed in the registry), not on M23's internal design. **Not a blocker for
   architecting M24.** It **is** a blocker for *implementing* M24 — see §3.

2. **M21 (Seats) and M2 (event log) are the other live dependencies.** M21 is `Defined`; M2 is `Documented`.
   M24 uses M21's device/Seat identity and the actor field ADR-0021 put on every event in 2.0. The actor field
   already exists in the schema (`events.actor`, `/docs/04-database-design.md` §4), so M24's provenance
   dimension is additive to a field that is present today — no chain rewrite, exactly as ADR-0021 intended.

3. **Scalability §4's "last-writer-wins for UI state."** `/docs/09-scalability.md` §4 sketched LWW for UI state
   as a 2.0 note. M24 honors it narrowly (a declared per-field allowlist for `ui_state`/`preferences`, §9.4)
   and supersedes it for everything audit-bearing, per the registry's exit criterion ("conflicts surface as
   Decisions"). Recorded in ADR-0065's Context. This is a refinement, not a contradiction; the registry
   supersedes the guide's milestone text (`/MILESTONE_REGISTRY.md` header).

## 3. Gate decision

M24's architecture is safe to write now: it extends the append-only event log (ADR-0002), the Decision Engine,
and the hosted topology the scalability doc committed to — none of which M24 modifies. **Proceed to architect
M24 (this package).**

**Ordering constraint carried to AntiGravity (not an architecture gap):** M24 must not be *implemented* until
M23 is architected and implemented, because sync needs a running hosted kernel with clients to converge
*between*. Building M24 against a single embedded process would force sync to invent the topology M23 owns —
the dependency the release map draws explicitly (`/MILESTONE_REGISTRY.md` §5, 3.0 chain: M23 → M24). The
`REVIEW_CHECKLIST.md` closing STOP restates this.

# M17 Architecture Audit — gate before M18

**Purpose.** STEP 1 of the workflow: before architecting the next milestone, verify that nothing in the
dependency graph blocks it, and report any gap. This audit gates M18 (Companion).

| | |
|---|---|
| Milestone at the previous number | M17 — First-Party Connector Suite |
| M17 registry status | **Defined** — purpose, dependency, and exit criterion fixed; architecture **not** yet written |
| Milestone being gated | M18 — Companion |
| M18 registry dependencies | **M10** (Brief format), **M15** (Approval Requests) — **not** M17 |
| Audit verdict | **No gap blocks M18. M18's real dependencies (M10, M15) are Documented; M18 does not depend on M17.** |
| Authoritative sources | `/MILESTONE_REGISTRY.md` §4, `/docs/04-database-design.md` (`briefs`, `approval_requests`, `decisions`), `/docs/01-technical-architecture.md` §4, `/docs/07-security-model.md`, ADR-0002, ADR-0009 |

---

## 1. The situation this audit must address

The milestone at the number immediately before M18 is **M17 (First-Party Connector Suite)**, and it is only
**Defined** — it has no architecture document and no implementation plan (`/MILESTONE_REGISTRY.md` §4). The M15
audit that gated M16 could report its predecessor "architecturally complete"; this audit cannot make the same
report about M17, because M17 has not been architected.

That would block M18 **only if M18 depended on M17.** It does not. The registry is explicit:

> **M18 — Companion.** Depends on: **M10** (Brief format), **M15** (Approval Requests).
> (`/MILESTONE_REGISTRY.md` §4, M18 row)

M17 is **absent** from M18's dependency list, and the dependency structure confirms it (`/MILESTONE_REGISTRY.md`
§5): M18 is annotated *"needs Brief + Approval Request formats"* — not connectors. The Companion carries Briefs
out and approvals back; both exist independently of any connector. A connector is a way for the Firm to reach
an external service; a Brief and an Approval Request are produced whether or not a single connector is
installed.

**Therefore M18 can be architected while M17 is merely Defined.** Doing so is a deliberate, dependency-driven
sequencing choice, permitted by the register (numbers are a global order, but the *build* order follows real
dependencies; anything out of order that crossed a real dependency would need an ADR — this does not,
`/MILESTONE_REGISTRY.md` §3, §6.3).

## 2. Checklist result — M18's actual dependencies

The artifacts M18 depends on are present and stable:

| M18 depends on | Present | Location / evidence |
|---|---|---|
| Brief format (M10) | ✅ | `briefs` table with the six fields `situation`, `actions`, `findings`, `recommendation`, `the_ask`, `confidence` (`/docs/04-database-design.md`); the sanitizing render pipeline and node allowlist (`/docs/01-technical-architecture.md` §4.4) |
| Approval Requests (M15) | ✅ | `approval_requests` table (`/docs/04-database-design.md`); one approval concludes a Mission (`/docs-v2/03-Intelligence/MISSION_ENGINE_ARCHITECTURE.md` §25.4) |
| Decisions & approval UX contract | ✅ | `decisions` table; the who/what/why/cost/if-no ordering and option set (`/docs/07-security-model.md` §6) |
| Security kernel (M3) | ✅ | keychain, redaction, Ed25519, the untrusted-client boundary (`/docs/01-technical-architecture.md` §4, `/docs/07-security-model.md` §8) |
| Event log & hash chain (M2, ADR-0002) | ✅ | `events` table; hash chain; the single-source-of-truth rule |
| Local-first / no-telemetry commitments | ✅ | ADR-0009 (no telemetry); the Layer-6 replaceability / offline posture (`/docs-v2/02-layer-model.md` §9) |

Every anchor M18 builds on is Documented and its shape is fixed. M18 reads `briefs` and `approval_requests`
and writes `decisions` through reconciliation; it modifies none of these schemas (it adds four additive tables,
`0033`–`0036`).

## 3. Discrepancies noted (non-blocking)

Per the standing rule "if a milestone's status appears out of sequence, note it and continue":

1. **M17 is unarchitected but earlier in number.** Normal sequence would architect M17 before M18. M18 was
   chosen because its dependencies (M10, M15) are ready and it does not touch the connector suite. This is a
   sequencing note, not an architectural gap. **Not a blocker for M18.** Recommended: architect M17 next, or
   record the deliberate reordering on the register at integration.

2. **Migration band coordination.** M16 (Connector Framework) uses migrations `0025`–`0029`. M18 begins at
   `0033`, leaving `0030`–`0032` for M17. If M17 is later documented with a different band, re-check for a
   collision — additive, forward-only migrations make this a low-risk, mechanical fix. **Not a blocker.**

3. **ADR numbering.** The connector framework used ADR-0034–0037. M18 uses ADR-0049–0051, leaving room
   (`0038`–`0048`) for M17 and any intervening decisions. If M17's ADRs land in that range, no collision with
   M18 results. **Not a blocker.**

## 4. Gate decision

M17's `Defined` status does **not** block M18, because M18 depends on M10 and M15 — both Documented — and not
on M17. **Proceed to M18 (Companion).** No M10, M15, M3, or M2 architecture is modified by the M18 package; M18
extends the substrate those milestones already provide (the Brief format, the Approval Request, the security
kernel, and the event log), which is the correct dependency direction.

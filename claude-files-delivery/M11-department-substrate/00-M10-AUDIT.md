# M10 Architecture Audit — gate before M11

**Purpose.** STEP 1 of the workflow: before architecting the next milestone, verify the previous one is
architecturally complete and report any gap. This audit gates M11 (Department substrate).

| | |
|---|---|
| Milestone audited | M10 — Hardening and 1.0 "Atrium" |
| Registry status | Documented (`/MILESTONE_REGISTRY.md` §4, 1.0 "Atrium") |
| Audit verdict | **Architecturally complete. No gap blocks M11.** |
| Authoritative sources | `/MILESTONE_REGISTRY.md`, `/MASTER_IMPLEMENTATION_GUIDE.md`, `/docs/06-implementation/02-testing-and-quality.md`, `/docs-v2/01-migration-strategy.md` |

---

## 1. Checklist result

M10 is the milestone at which **1.0 "Atrium" ships as a complete product** (`/MASTER_IMPLEMENTATION_GUIDE.md`
§5). Its exit criterion is *thirty days dogfooding, zero data loss, zero unlogged effects*
(`/MILESTONE_REGISTRY.md` §4; `/MASTER_IMPLEMENTATION_GUIDE.md` §5). M11 does not extend M10; it begins the 2.0
substrate on top of the finished 1.0 kernel (`/docs-v2/02-implementation-changes.md` preamble: "M1–M10 are
unchanged … The enterprise work is M11–M14 and begins after 1.0 ships"). The audit is therefore at the
**architectural level**: are the 1.0 subsystems M11 depends on present, stable, and of the shape M11 assumes?

| M11 dependency (see architecture §Dependencies) | Present at M10 | Basis |
|---|---|---|
| Event log, hash chain (M2) | ✅ | 1.0 kernel; source of truth, append-only (ADR-0002); M10 exit asserts zero unlogged effects |
| Permission Broker + capability model (M3) | ✅ | 1.0 kernel; the sole choke point (`/MASTER_IMPLEMENTATION_GUIDE.md` §3 item 5) |
| Model Gateway + three nested ceilings (M4) | ✅ | 1.0 kernel; turn/engagement/month ceilings (ADR-0020 Context) |
| Memory Service + namespaces (M5) | ✅ | 1.0 kernel; five layers, hybrid retrieval (ADR-0007) |
| Orchestrator + typed durable Work Orders (M6) | ✅ | 1.0 kernel; ADR-0010 — the envelope M11 adds two optional fields to |
| Forward-only idempotent migrations (M2 store rule) | ✅ | `/docs/04-database-design.md` §10; the policy M11's band 0002–0006 obeys |
| Recorded v1 Engagements to replay against | ✅ (by construction) | The event log is complete and durable (ADR-0002); a completed 1.0 Engagement is a recordable corpus item |
| Kernel-as-library (no app logic in the kernel) | ✅ | `/docs/01-technical-architecture.md` §1, §6; the property that makes an invisible substrate possible (`/docs-v2/01-migration-strategy.md` §1) |
| Performance gates live (cold start ≤1.2 s, 60 fps, idle ≤400 MB) | ✅ | CI gates from M1 (`/MASTER_IMPLEMENTATION_GUIDE.md` §7); M11 re-verifies, does not introduce them |
| Author ≠ reviewer enforced | ✅ | `/docs/04-database-design.md` §2 `reviews` CHECK; ADR-0008 |

Every subsystem M11 builds on is a finished 1.0 kernel component. M11 adds columns and department-parametric
resolution; it modifies no M10 invariant.

## 2. Discrepancies noted (non-blocking)

Per the standing rule "if registry metadata appears stale compared to the source documents, note it and
continue":

1. **Migration-band numbering is stale in a v2 source.** `/docs-v2/02-implementation-changes.md` §3 names M11's
   migrations as `0012_departments.sql`–`0018_applications.sql` and folds M12–M14 tables (standards, guards,
   registries, applications, exchange_requests) into the same list. The milestone facts governing M11 assign it
   band **`0002`–`0006`** (additive, forward-only; `0001` is the v1 base; `0019+` are taken by M15/M16). That
   v2 document predates the single-global-milestone-numbering reconciliation (ADR-0032) and the substrate/visible
   split. This is a documentation lag, not an architectural gap: the substrate needs only the five migrations in
   the architecture's persistence table; the deferred tables land in their owning milestones (M12–M13).
   **Recommended fix:** reconcile the band during integration. **Not a blocker for M11.**

2. **M11 scope is broader in one v2 source than the registry's substrate definition.**
   `/docs-v2/02-implementation-changes.md` §1 lists `sidra-registry`, a Guard Runner extension, and an Exchange
   extension under M11 alongside `sidra-departments`. `/docs-v2/01-migration-strategy.md` §4 (steps 3–4) resolves
   the apparent breadth: Standards and Guards ship with an **empty set** ("No standards means no change") and the
   Exchange ships **unused** while there is one department. The registry (`/MILESTONE_REGISTRY.md` §4) and the
   guide (`/MASTER_IMPLEMENTATION_GUIDE.md` §5) scope M11 to the invisible substrate whose exit is replay
   equivalence. This package therefore centres the one load-bearing new crate, `sidra-departments`, and treats
   the empty Standards/Guard/Exchange machinery as no-op seams delivered in this band and given behaviour at
   M12–M13. **Recommended:** state this split explicitly on integration so M12/M13 own the visible machinery.
   **Not a blocker.**

3. **ADR-0033 is `Proposed`, not `Accepted`** (`/docs-v2/adr/README.md`). M11 does not depend on the Charter
   partial-order comparison. Per the rule that ADR status does not block future architecture unless the content
   is incomplete, this does not gate M11. Recorded here as context only.

## 3. Gate decision

M10 is architecturally complete and 1.0 is a finished product. **Proceed to M11 (Department substrate).** No
M10 architecture is modified by the M11 package; M11 extends the substrate M10 already provides — the event
log, the Permission Broker, the Model Gateway, the Memory Service, and the typed Work Order — which is the
correct dependency direction (`/docs-v2/01-enterprise-architecture.md` §3: "None of these replaces an existing
service. Each extends the boundary of one that already exists"). The two discrepancies above are documentation
reconciliations for the integration pass, not gaps in the ground M11 stands on.

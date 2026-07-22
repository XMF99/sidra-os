# M11 Architecture Audit — gate before M12

**Purpose.** STEP 1 of the workflow: before architecting the next milestone, verify the previous one is
architecturally complete and report any gap. This audit gates M12 (Structure). M12 builds *visible* enterprise
structure directly on M11's *invisible* substrate, so the gate is stricter than usual: it confirms not only
that M11 exists, but specifically that the replay-equivalence substrate M12 stands on is in place.

| | |
|---|---|
| Milestone audited | M11 — Department substrate |
| Registry status | Documented (`/MILESTONE_REGISTRY.md` §4, 2.0 "Concourse") |
| Audit verdict | **Architecturally complete. No gap blocks M12.** |
| Authoritative sources | `/MILESTONE_REGISTRY.md`, `/docs-v2/01-enterprise-architecture.md`, `/docs-v2/03-department-architecture.md`, `/docs-v2/01-migration-strategy.md`, `/MASTER_IMPLEMENTATION_GUIDE.md` §5 |

---

## 1. What M11 is required to deliver

M11's exit criterion (`/MILESTONE_REGISTRY.md` §4): **"Replay equivalence green; the Firm runs as one implicit
department with byte-identical behaviour."** M11 is deliberately invisible — nothing the Principal sees changes
(`/docs-v2/01-migration-strategy.md` §4 steps 1–4). It is the substrate; M12 is the first visible structure
(`/MASTER_IMPLEMENTATION_GUIDE.md` §5). Concretely, M11 must deliver migration steps 1–4
(`/docs-v2/01-migration-strategy.md` §4):

1. Schema additions — nullable columns, new tables, new event kinds; nothing reads them yet.
2. The **Department Registrar** (`sidra-departments`), loading exactly one implicit department containing all
   eleven agents; behaviour identical.
3. The **Standards Engine** and **Guard Runner**, shipped with an empty Standards set (no Standards means no
   change).
4. The **Exchange**, unused while there is one department.

## 2. Checklist result

Every substrate M12 depends on is present in the M11 architecture:

| Required substrate (M12 depends on it for…) | Present | Location |
|---|---|---|
| **Replay-equivalence test** — the gate M12's visible change must not break | ✅ | `/docs-v2/01-migration-strategy.md` §6 (byte-identical Brief on a v2 kernel); CI gate `/MASTER_IMPLEMENTATION_GUIDE.md` §7 |
| **Department Registrar & org graph** — M12 grows it to 8 Divisions + 4 Offices | ✅ | `/docs-v2/01-enterprise-architecture.md` §3 ("holds the org graph"); `/docs-v2/03-department-architecture.md` |
| **One implicit department** — M12's null-structure end state equals this | ✅ | `/docs-v2/01-migration-strategy.md` §3–§4 step 2 |
| **Guard Runner** — M12 wires the first firm-wide blocking vetoes through it | ✅ | `/docs-v2/01-enterprise-architecture.md` §3 (extends the Broker; blocks or warns) |
| **Permission Broker (M3)** — the choke point the veto extends | ✅ | `/MASTER_IMPLEMENTATION_GUIDE.md` §3 item 5; `/docs/01-technical-architecture.md` §1 |
| **Standards Engine** — firm Standards set by Offices resolve against it | ✅ | `/docs-v2/01-enterprise-architecture.md` §3; `/docs-v2/02-agent-architecture-v2.md` §6 |
| **Exchange** — the arbitration substrate Divisions sit above | ✅ | `/docs-v2/03-department-architecture.md` §5 |
| **Event log (M2)** — structural and veto events land on the hash chain | ✅ | `/docs/04-database-design.md` §4; ADR-0002 |
| **Additive compatibility contract** — M12's 0007–0010 obey it | ✅ | `/docs-v2/01-migration-strategy.md` §2 |
| **Schema additions (steps 1)** — M12's migrations continue the band | ✅ | `/docs-v2/01-migration-strategy.md` §4 step 1; `/docs/04-database-design.md` §10 |

**The replay-equivalence substrate, specifically confirmed.** M12 changes the interface (the Rail shows
Divisions) and widens the vetoes firm-wide (`/docs-v2/01-migration-strategy.md` §4 steps 5–6). The only thing
that makes those changes safe is the equivalence test that proves *nothing else moved*
(`/MASTER_IMPLEMENTATION_GUIDE.md` §5: "shipping an interface change before the equivalence test exists to
prove nothing else moved is the single ordering mistake that converts this migration into a rewrite"). That
test is specified in `/docs-v2/01-migration-strategy.md` §6 and is a standing CI gate
(`/MASTER_IMPLEMENTATION_GUIDE.md` §7). It is present, and it is the precondition M12's acceptance criterion
AC12 re-asserts on a null-structure Firm.

## 3. Discrepancies noted (non-blocking)

Per the standing rule "if registry metadata appears stale compared to git history, note it and continue":

1. **M11 is Documented; implementation completeness is AntiGravity's to verify.** `/MILESTONE_REGISTRY.md` §4
   lists M11 as Documented. This audit certifies the *architecture* M12 depends on, not the running code. The
   replay-equivalence test being *green in CI* is an implementation-verification concern owned by AntiGravity
   (`/MASTER_IMPLEMENTATION_GUIDE.md` §5–§6), and M12 must not be demonstrated until it is. Recorded here as
   the one thing AntiGravity must confirm before starting E7.
2. **Division count at the migration's step 5 is four, not eight.** `/docs-v2/01-migration-strategy.md` §3
   describes the upgrade moment as four Divisions and two Offices, "the other four appear when their
   departments are installed." This is the *gradual rollout narrative*, not a contradiction of M12's exit
   criterion. M12 establishes the full eight-Division, four-Office **skeleton** (the Executive Layer); the
   member *departments* populate the Divisions in M13 (`/MILESTONE_REGISTRY.md` §4). A Division established
   with zero departments is legitimate (`/docs-v2/01-org-chart-v2.md` §7, and Security is a Division of one by
   design, §4). This is reconciled in `STRUCTURE_ARCHITECTURE.md` §3.1 and is not a gap.

## 4. Gate decision

M11 is architecturally complete, and the specific substrate M12 stands on — the Registrar's org graph, the
Guard Runner, the one-implicit-department state, and above all the replay-equivalence test — is present.
**Proceed to M12 (Structure).** No M11 architecture is modified by the M12 package; M12 extends the substrate
M11 shipped (the org graph, the Guard Runner, the event log) in the correct dependency direction (ADR-0011).
**Before E7 is demonstrated, AntiGravity must confirm the replay-equivalence CI gate is green** — that is the
one implementation precondition this architecture cannot certify from the documents alone.
</content>

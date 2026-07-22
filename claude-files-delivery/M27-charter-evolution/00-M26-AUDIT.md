# M26 Architecture Audit — gate before M27

**Purpose.** STEP 1 of the workflow: before architecting the next milestone, verify the milestone it depends
on is defined precisely enough that the new architecture can extend it without contradiction, and report any
gap. This audit gates M27 (Charter Evolution). M27 depends on **M26** (Outcome Calibration — the performance
data) and **M13** (departments & Role Archetypes — the unit that improves).

| | |
|---|---|
| Milestone audited | M26 — Outcome Calibration |
| Registry status | **Defined** (`/MILESTONE_REGISTRY.md` §4, 4.0 "Continuum") · architecture not yet written |
| Also gated on | M13 — Departments (**Documented**); ADR-0014 Role Archetypes (**Accepted**) |
| Audit verdict | **M27 architecture may proceed against M26's registry-pinned contract. M27 _implementation_ must not complete until M26 is Documented and its outcome-record read surface exists.** |
| Authoritative sources | `/MILESTONE_REGISTRY.md` §4, §5; `/MISSION_ENGINE_ARCHITECTURE.md` §12/§19/§27 (outcome records); `/docs/04-database-design.md` (`agent_versions`, `agent_kpi_samples`); ADR-0009, ADR-0014, ADR-0033 |

---

## 1. What M27 needs from M26, and whether it is fixed

M27 does not need M26's *internals*. It needs M26's **contract surface**: a local, inspectable, revertible
record of observed performance per archetype, from which a charter revision can be motivated and to which its
provenance can point. The registry pins that contract exactly enough to architect against.

| M27 needs from M26 | Fixed by | Present |
|---|---|---|
| A per-archetype record of observed performance (outcome vs. plan, KPI drift) | Registry §4 M26 purpose: *"Mission outcome records calibrate estimates, novelty scores and risk weights"*; `mission_outcomes` (M15 §27.3), `agent_kpi_samples` (`/docs/04-database-design.md`) | ✅ contract fixed; read surface lands with M26 |
| That the data is **local only** — no telemetry — so the whole evolution loop can honour ADR-0009 | Registry §4 M26: *"Local only — ADR-0009 stands, no telemetry leaves the machine"* | ✅ |
| That the calibration is **inspectable and revertible** (so an evolution proposal citing it can be audited and undone) | Registry §4 M26 exit criterion: *"the calibration is inspectable and revertible"* | ✅ |
| The **unit** that improves is the Role Archetype, versioned as charter data | ADR-0014 (archetypes are templates, data, versioned); `agent_versions` (`/docs/04-database-design.md`); GUIDE §3 item 15 | ✅ |

M26's exit criterion — *"estimate error narrows measurably over 50 concluded Missions; the calibration is
inspectable and revertible"* — is the guarantee M27 consumes. M27 never re-derives calibration; it reads the
performance record M26 produces and turns an observed shortfall into a **proposal**, gated by the archetype's
evaluation set. The interface M27 requires from M26 is small and read-only, and it is stated in this package
(`CHARTER_EVOLUTION_ARCHITECTURE.md` §16.1) so the two can be built in dependency order.

## 2. Discrepancies noted (the honest gate)

Per the standing rule "if a dependency is not yet where you assumed, note it and continue rather than silently
build on a state that does not exist":

1. **M26 is `Defined`, not `Documented`.** Unlike the M16→M15 gate (where M15 was already Documented), M27's
   direct dependency has a fixed purpose, dependency and exit criterion but **no architecture document yet**.
   This does **not** block *architecting* M27 — the registry contract above is sufficient to design a net-new
   subsystem that extends it — but it **does** bound implementation: M27's evaluation-run scoring and its
   proposal provenance read from M26's outcome-record surface, which must exist first. Recorded as dependency
   **D-1** in the architecture (§16.1) and as the first line of the M27 STOP note. **This is a sequencing
   constraint, not an architectural gap.**

2. **The outcome-record read surface is named but not yet a crate boundary.** M15 writes `mission_outcomes`
   and the Mission Engine compacts them (`/MISSION_ENGINE_ARCHITECTURE.md` §27.3); M26 is expected to expose a
   calibration/read module over those plus `agent_kpi_samples`. M27 depends on that read module (working name
   `sidra-calibration`), not on the Mission Engine directly — preserving the dependency direction (ADR-0011).
   Until M26 names it, M27's architecture depends on the **contract**, and its implementation plan (E2) gates
   the evaluation-run scoring behind that read surface. Not a blocker for architecture.

3. **ADR-0033 is `Proposed`, not `Accepted`.** ADR-0033 (Charter comparison is a partial order) is the
   load-bearing input to M27's regress gate — it defines what "widens authority" means and treats
   `Incomparable` as widening. Its content is complete and internally consistent (`/docs-v2/adr/0033-*`). Per
   the rule that ADR status does not block downstream architecture when the content is complete, this does not
   gate M27. Recommended: promote ADR-0033 to `Accepted` in the same integration pass that lands M27's gate,
   since M27 makes it load-bearing at a second site (charter *evolution*, not just Mission replanning).

## 3. Gate decision

M26's contract is fixed by the registry; M13 and ADR-0014 are in place; ADR-0033 supplies the comparison M27
needs. **Proceed to architect M27 (Charter Evolution).** No M26, M13, or ADR-0033 decision is modified by the
M27 package; M27 extends the substrate they establish (outcome records, versioned archetype charters, the
partial-order comparison) — the correct dependency direction.

**One carried-forward constraint, non-negotiable:** M27 *implementation* is gated on M26 being Documented and
its outcome-record read surface existing (dependency D-1). The architecture is written so this is a wiring
concern (a single read module, §16.1), not a redesign. This constraint is the first line of the M27 STOP note.

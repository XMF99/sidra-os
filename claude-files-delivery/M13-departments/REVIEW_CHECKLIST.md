# M13 Departments — Review Checklist

**Gate before handoff to AntiGravity.** This confirms the architecture package is complete, internally
consistent, and ready to implement. It is a checklist for the architect (self-review) and the Principal
(approval), not for the implementer.

---

## 1. Documents complete

- [x] Architecture document — `DEPARTMENTS_ARCHITECTURE.md` (why it exists, design goals, the Pack, domain
      model, the Registrar, the Exchange, Standards & Guards, Registries, Archetypes, the three exit-criterion
      departments, persistence, events, APIs, sequence diagrams, failure scenarios, performance, dependencies,
      risks, acceptance criteria, appendices)
- [x] Implementation plan — `IMPLEMENTATION_PLAN.md` (E1–E10, tasks with complexity, deps, files, AC, order)
- [x] Review checklist — this document
- [x] M12 audit (STEP 1 gate) — `00-M12-AUDIT.md`
- [x] Delivery index — `README.md`

## 2. ADRs complete

- [x] ADR-0043 — Exchange contract resolution is deterministic, and ambiguity is refused
- [x] ADR-0044 — The exit-criterion conformance set is Backend, Cybersecurity, and Software Engineering

Each follows the repo format (Context → Options → Decision → Consequences, split into accepted / gained /
reversal cost). Status `Proposed`. This package holds ADR-0043 and ADR-0044, immediately after M12's 0042.

- [x] **M13 is largely covered by existing ADRs.** ADR-0013 (Packs), ADR-0014 (archetypes), ADR-0016
      (Standards & Guards), ADR-0017 (Registries) already decide the substance; this package writes new ADRs
      *only* for the two points the sources leave open (contract-resolution disambiguation; the three-department
      conformance set). No existing ADR is re-decided.
- [ ] **Integration action (AntiGravity):** copy the two ADRs into `docs-v2/adr/`, add their rows to
      `docs-v2/adr/README.md`, mark them `Accepted` on Principal approval. ADR numbering across the M10–M14
      packages is contiguous: 0038–0039 (M10), 0040–0041 (M11), 0042 (M12), 0043–0044 (M13), 0045 (M14).

## 3. Dependencies verified

- [x] M11 (department substrate, replay equivalence, the implicit single department) — the substrate M13
      installs Packs onto
- [x] M12 (Divisions, Offices, firm-wide vetoes) — the structure M13 installs departments into; `[review]`
      blocks resolve to M12's Offices
- [x] M9 (plugin trust chain + Wasm host) — Pack signatures; `tools/` and Wasm Guards in the existing sandbox
- [x] M3 (Permission Broker, capability grammar, redaction) — the three nested subsets; default-deny; sole
      choke point
- [x] M2 (event log) — install/grant/exchange/guard/registry events on the existing hash chain
- [x] Dependency direction preserved: `packages/domain ← services/departments, services/registry ← apps/*`;
      **no** edge to `services/orchestrator` or `services/mission` (CI-enforced, AC12); the Exchange lives in
      `sidra-orchestrator` and calls *into* the Registrar (correct direction), justified in §Appendix B

## 4. Consistency with authoritative sources

- [x] The twelve mechanical install checks match `03-department-architecture.md` §8 verbatim; the connector
      manifest's ten checks (M16 §5.4) mirror these
- [x] The Exchange matches `03-department-architecture.md` §5: contracts not departments, cost-follows-
      requester, depth limit 2, cycles refused, `contract_unavailable` clean failure
- [x] Which departments exist and their `provides`/`requires` match `04-department-catalog.md`; the exit-
      criterion trio and its one Exchange request are drawn from `03-department-architecture.md` §2 and §5
- [x] The three-act install (acquire/install/grant) matches `05-marketplace-and-packs.md` §2; **installation
      never grants authority** (GUIDE §3 item 8); the install path writes no grant
- [x] Standards & Guards match ADR-0016: every Standard ships a Guard; three Guard tiers; Guards are not shell
      scripts; the Guard-corpus CI gate (GUIDE §7)
- [x] Registries match ADR-0017: append-only, one owner per fact, `referenced_by`, consistency Guard,
      Principal-confirmed promotion to Canon
- [x] Archetypes match ADR-0014: template vs instance, lazy instantiation, charter frozen at instantiation,
      autoscale under the budget sub-ceiling
- [x] Capability grammar and effect classes match `/docs/07-security-model.md` §4–§5; v1 governs where it
      conflicts with v2 (GUIDE §2)
- [x] Layer model respected: departments are Layer-3 artifacts, the four services are Layer-1 kernel; the
      Layer-3 replaceability test (uninstall all → kernel and executive still run) holds (`02-layer-model.md` §9)
- [x] Milestone meaning per `/MILESTONE_REGISTRY.md` (M13 = Departments; exit criterion three-departments +
      one-Exchange-request); registry governs where any document disagrees
- [x] **The kernel contains no department-specific logic** — CI grep asserted (AC10); the exit-criterion trio
      is fixture data, never kernel code
- [x] No existing architecture modified; no ADR decision reversed; no documentation duplicated

## 5. Acceptance criteria complete

- [x] AC1–AC12 defined in the architecture §18 and each mapped to a task in E10
- [x] The exit criterion ("three departments installed from Packs, and one Exchange request end to end") is
      **AC1 + AC4**, owned by task T10.9 — the last thing to go green
- [x] "Installation grants nothing" (AC2), "every Standard has a Guard" (AC7), "agent→department resolution"
      (AC5), and "kernel neutrality" (AC10) are the invariants that make the exit meaningful; each is a named
      test, none relies on configuration or manual verification

## 6. Scope discipline

- [x] No production code in this package (architecture and plan only)
- [x] **Three** departments, not twenty-one — the exit criterion is minimal by design (Principle 13); the other
      eighteen departments are later work
- [x] Installation grants nothing — acquire, install, grant are three separate logged acts; the install path
      writes no capability grant
- [x] The Game Studio (49 archetypes) and the public Marketplace catalogue are **out of scope** — they are M14
- [x] The Mission Engine is out of scope — it is M15 and depends on this substrate

## 7. Open items carried forward (non-blocking)

- [x] ADR numbering is contiguous across the M10–M14 delivery packages: 0038–0039 (M10), 0040–0041 (M11),
      0042 (M12), 0043–0044 (M13), 0045 (M14) — no gaps, no reservations outstanding
- [ ] Registry metadata: `MILESTONE_REGISTRY.md` §4 already marks M13 "Documented"; the status becomes correct
      on merge of this package (`00-M12-AUDIT.md` §2)
- [ ] On integration, confirm `MILESTONE_REGISTRY.md` M13 status `Documented` (renumbering becomes forbidden at
      that point, per registry rule 4)

## 8. The M16 dependency (stated explicitly)

- [x] **M13's Registrar is what M16 grants against.** M16's per-department connector isolation resolves the
      calling agent's department through `resolve_department` (M16 §9 step 1). **M13 must land, integrate, and
      demonstrate its exit criterion before M16 is certifiable** (`/MILESTONE_REGISTRY.md` §5, dependency 2).
      This is recorded so the build order is not argued down under schedule pressure.

## 9. Ready for AntiGravity

- [x] Documents complete
- [x] ADRs complete
- [x] Dependencies verified
- [x] Acceptance criteria complete
- [x] **Ready for implementation.** Recommended start: E1 → E2 → E3, then E4/E5-E6/E7/E8 in parallel. E10 (the
      three-department install + one-Exchange-request proof) is the last thing to go green.

**STOP.** Per the workflow, do not continue to M14 until AntiGravity completes M13 implementation and
integration and the exit criterion is demonstrated.

# M25 Firm Templates and Portability — Review Checklist

**Gate before handoff to AntiGravity.** This confirms the architecture package is complete, internally
consistent, and ready to implement. It is a checklist for the architect (self-review) and the Principal
(approval), not for the implementer.

---

## 1. Documents complete

- [x] Architecture document — `FIRM_TEMPLATES_AND_PORTABILITY_ARCHITECTURE.md` (why it exists, lifecycle,
      domain model, the structure/data boundary, components, security, "reproduces the structure" precisely,
      Marketplace distribution, APIs, persistence, effect classes, sequence diagrams, failure scenarios,
      performance, dependencies, risks, acceptance criteria, testing + CI, appendices)
- [x] Implementation plan — `IMPLEMENTATION_PLAN.md` (E1–E7, tasks with complexity, deps, files, AC, order)
- [x] Review checklist — this document
- [x] M24 audit (STEP 1 gate) — `00-M24-AUDIT.md`
- [x] Delivery index — `README.md`

## 2. ADRs complete

- [x] ADR-0067 — A Firm Template carries structure, never data — the boundary is defined and enforced
- [x] ADR-0068 — Firm Templates distribute through the existing Marketplace trust chain, and installation
      grants nothing

Each follows the repo format (Context → Options → Decision → Consequences, with accepted / gained / reversal
cost; `/docs-v2/adr/README.md` §Format). Numbering is **0067–0068**, continuing the global sequence and not
exceeding 0068 per the milestone instruction. Status `Proposed`.

- [ ] **Integration action (AntiGravity):** confirm 0067–0068 are free after M17–M24; copy the two ADRs into
      `docs-v2/adr/`, add their rows to `docs-v2/adr/README.md`, and mark them `Accepted` on Principal approval.

## 3. Dependencies verified

- [x] M14 (Marketplace / Pack machinery) — the distribution mechanism M25 reuses; `05-marketplace-and-packs.md`
      §1–§6; a Template is the top-row artifact, acquire/install/grant unchanged (ADR-0068)
- [x] M21 (Seats) — the seat model a Template is agnostic to; ADR-0021; the target Vault's single Seat is the
      install actor
- [x] M13 (departments + Registrar) — writes the reproduced org chart; instantiates heads (ADR-0014)
- [x] M2 (event log) — `TemplateExported`/`TemplateInstalled` land on the existing hash chain
- [x] M3 (security kernel) — redaction/secret scan reused in the boundary check; the Broker keeps an
      ungranted reproduced department idle
- [x] Dependency direction preserved: `packages/domain ← services/portability ← apps/*`; **no** edge to
      `services/orchestrator`, `services/mission`, or any operational-data/memory-content service (CI-enforced,
      AC3 — this absence is what makes "structure, not data" a build property, ADR-0067)

## 4. Consistency with authoritative sources

- [x] Distribution matches `05-marketplace-and-packs.md`: acquire/install/grant three acts (§2), trust tiers
      (§3), signing (ADR-0006), no-auto-update / no-phone-home / no-execute-during-discovery (§5); a Template
      adds an artifact, not a new distribution path (ADR-0068)
- [x] **Install grants nothing** — matches `/MASTER_IMPLEMENTATION_GUIDE.md` §3 item 8 / §12 permanent-no; a
      Template has no capability-grant field; reproduction installs Packs, never grants (§7.3)
- [x] The Pack trust chain is intact: a Template references Packs by pinned manifest hash, never embeds a Pack
      body; each resolved Pack re-runs the twelve checks (ADR-0013, §4.6)
- [x] The structure/data boundary partitions every table through M24 (`/docs/04-database-design.md`); Canon is
      split row-level into structural (opt-in) vs data (excluded); Seats excluded (ADR-0021)
- [x] Layer model respected: a Template is a Layer-8 Marketplace artifact; the Layer-8 offline-replaceability
      posture holds (export local; install offline when Packs are local; never phones the source, §15)
- [x] Milestone numbering per `MILESTONE_REGISTRY.md` (M25 closes 3.0; ADR-0032 single global numbering)
- [x] No existing architecture modified; no ADR decision reversed; no documentation duplicated

## 5. Acceptance criteria complete

- [x] AC1–AC12 defined in the architecture §17 and each mapped to a task in E7 (and the CI checks in §18/T7.8)
- [x] The exit criterion ("installs into an empty Vault; reproduces structure without data") is AC4–AC9,
      owned by tasks T7.3–T7.4 (structure) and **T7.9 (zero source data — the last thing green)**
- [x] The zero-data proof asserts COUNT = 0 on every data-side table with a *populated* source Firm — proving
      the boundary held under load, not that an empty Firm exports an empty Template
- [x] Every AC is testable and named; none relies on configuration or manual inspection

## 6. Scope discipline

- [x] No production code in this package (architecture and plan only)
- [x] **Structure, not data** — the boundary is defined (§5), enforced three ways (dependency graph + export
      check + CI test), and re-verified at the importer (§7.6)
- [x] **Install grants nothing** — reproduction ends at *install*; grant is a separate Principal act (§7.3)
- [x] Merging a Template into a *non-empty* Firm is **out of scope** (would need its own ADR — §7.5); install
      into a non-empty Vault is a defined refusal, not an attempted merge
- [x] Template "diffing" and live re-sync from a source Firm are out of scope (no-phone-home, ADR-0068)

## 7. Open items carried forward (non-blocking)

- [ ] Confirm ADRs `0067`–`0068` and migrations `0054`–`0056` are free after M17–M24 land; renumber only on a
      real collision (registry rule: numbering is permanent once documented) — see `00-M24-AUDIT.md` §3
- [ ] Partition-completeness (§18 CI check) must be re-run after any milestone that adds a table, so every new
      table is classified (as *data* by default, §5.2) — a standing integration obligation, not an M25 blocker
- [ ] On integration, update `MILESTONE_REGISTRY.md` M25 status `Defined → Documented` (renumbering becomes
      forbidden at that point, per registry rule 4)

## 8. Ready for AntiGravity

- [x] Documents complete
- [x] ADRs complete
- [x] Dependencies verified
- [x] Acceptance criteria complete
- [x] **Ready for implementation.** Recommended start: E1 → E2, with E4/E5 in parallel once E1 lands, then E3
      (needs E5), E6 alongside E3, and **E7 (the reproducibility proof) is the last thing to go green — its
      final task T7.9 (zero source data in the installed Vault) last of all.**

**STOP — this closes release 3.0 "Chambers".** Do not begin M26 (4.0 "Continuum") until AntiGravity completes
M25 implementation, integration, and the template-into-empty-Vault exit criterion is demonstrated.

# M14 Game Studio and Marketplace — Review Checklist

**Gate before handoff to AntiGravity.** This confirms the architecture package is complete, internally
consistent, and ready to implement. It is a checklist for the architect (self-review) and the Principal
(approval), not for the implementer.

---

## 1. Documents complete

- [x] Architecture document — `GAME_STUDIO_AND_MARKETPLACE_ARCHITECTURE.md` (why it exists, design goals, the
      CCGS analysis + compile-not-embed, domain model, the Marketplace, Review Intensity, licence/attribution,
      the uninstall path, persistence, events, APIs, sequence diagrams, the nine-item list, failure scenarios,
      performance/offline, dependencies/risks, acceptance criteria, appendices incl. the MIT attribution
      appendix)
- [x] Implementation plan — `IMPLEMENTATION_PLAN.md` (E1–E8, tasks with complexity, deps, files, AC, order)
- [x] Review checklist — this document
- [x] M13 audit (STEP 1 gate) — `00-M13-AUDIT.md`
- [x] Delivery index — `README.md`

## 2. ADRs complete

- [x] ADR-0045 — The Marketplace is distribution-only; it reuses the M13 install path and adds no install or
      trust mechanism (Status `Proposed`)
- [x] Follows the repo format (Context → Options → Decision → Consequences, with accepted / gained / reversal
      cost). This package holds the single new ADR-0045 — the last in the contiguous 0038–0045 range across the M10–M14 packages.
- [x] The two **governing** decisions are already Accepted in the repo and are **not** re-decided here:
      ADR-0018 (Review Intensity) and ADR-0019 (compile-don't-embed). This package cites them; it does not
      restate or amend them.
- [ ] **Integration action (AntiGravity):** copy ADR-0045 into `docs-v2/adr/`, add its row to
      `docs-v2/adr/README.md`, and mark it `Accepted` on Principal approval.

## 3. Dependencies verified

- [x] M13 (Registrar, the twelve install checks, the eight-phase lifecycle incl. **Retired**) — present in
      `/docs-v2/03-department-architecture.md` §3, §7, §8; confirmed by `00-M13-AUDIT.md`
- [x] M12 (Divisions + Offices) — the Game Studio Division; binding Office vetoes vs advisory stage gates
- [x] M11 (the six primitives: Standards, Guards, Registries, Stage Models, Review Intensity, evidence-based
      advancement) — the Game Studio instantiates them; it does not build them
- [x] M9 (plugin signing chain + Wasm host) — Pack signature verification; the three Tier-2 Guard validators
- [x] M2 (event log) — the distribution/lifecycle events land on the existing hash chain
- [x] **No new kernel crate**; **no department-specific kernel logic** (CI grep, AC-K1); the Marketplace reuses
      the M13 install path (ADR-0045)

## 4. Consistency with authoritative sources

- [x] The CCGS analysis (`/docs-v2/01-repository-analysis.md`) — inventory, the six extracted primitives, and
      "what is deliberately not adopted" reproduced faithfully (§3)
- [x] The Game Dev department (`/docs-v2/02-game-studio-department.md`) — structure, model classes, stage
      model, standards, guards, registries, playbooks, defaults reproduced faithfully (§4, §6, §10 refs)
- [x] The integration plan (`/docs-v2/03-integration-plan.md`) — the compile mappings (§2–§6), attribution
      obligations (§7), and the acceptance list (§9) reproduced; the six §9 items are items 1–6 of the exit list
- [x] ADR-0018 (Review Intensity) — three modes, no `solo`, author ≠ reviewer absolute, Security/class-3 exempt
      (§6) — cited, not re-decided
- [x] ADR-0019 (compile-not-embed) — the four options, the decision, and the accepted consequences (fork drift,
      lost capability, provenance) reproduced (§3) — cited, not re-decided
- [x] The Marketplace (`/docs-v2/05-marketplace-and-packs.md`) — the three acts, trust tiers, no auto-update,
      "may never do" list, and the working-local-publisher-with-empty-catalogue posture (§5)
- [x] The layer model (`/docs-v2/02-layer-model.md`) — Layer 8 distribution ≠ authority (§8); the Layer-3 and
      Layer-8 replaceability tests (§9) mapped to AC6 and §15
- [x] Milestone meaning per `/MILESTONE_REGISTRY.md` (M14 = Game Studio and Marketplace; 2.0 ships here; exit =
      the nine-item acceptance list incl. uninstall-leaves-Firm-working)
- [x] v1 governs where v1 and v2 conflict (`/MASTER_IMPLEMENTATION_GUIDE.md` §2); no existing architecture
      modified; no ADR reversed; no documentation duplicated

## 5. The nine-item exit criterion complete

- [x] The nine-item list reproduced in §13 and each item made an explicit, named, objectively testable AC in
      §17 (AC1–AC9)
- [x] Items 1–6 reproduced from `/docs-v2/03-integration-plan.md` §9; items 7–9 sourced from
      `/docs-v2/05-marketplace-and-packs.md` §2/§6 and `/docs-v2/02-layer-model.md` §8 — the consolidation is
      disclosed in §13, not hidden
- [x] The headline item — **uninstall-leaves-Firm-working** — is item 6 / AC6, owned by task T8.9, the last
      thing to go green
- [x] Every AC is testable and named; none relies on configuration or manual verification

## 6. Scope discipline

- [x] No production code in this package (architecture and plan only)
- [x] **Compile, not embed:** the Firm never runs Claude Code, never vendors the repo, never grants ambient
      shell; the Game Studio is a Department Pack the kernel does not special-case (ADR-0019; AC-K1)
- [x] **Author ≠ reviewer preserved:** Review Intensity changes how much review, never whether; no `solo`;
      Security/class-3 exempt from the dial (ADR-0018; AC-R1)
- [x] **Licence-obligation check:** CCGS MIT enforced mechanically — `PROVENANCE.md`, MIT text, origin line,
      `derived_from`; a Pack missing any does not publish (§7; AC-L1)
- [x] M15 (Mission Engine) is **out of scope** — already `Documented · Open` in the registry; no work owed here
- [x] Non-Department-Pack distributable types (Role/Playbook/Standards/Integration Packs, Themes) flagged as
      existing in the layer but not exercised beyond the shared three-act machinery (§16.2)

## 7. Open items carried forward (non-blocking)

- [ ] Confirm migration band `0016`–`0018` is free before writing `0016_*` (M11–M13 below, M15 above) — see
      `00-M13-AUDIT.md` §3.1
- [ ] Registry primary-document pointer for M14 (`/docs-v2/03-game-studio/*`) is stale vs the actual sources —
      correct during integration (see `00-M13-AUDIT.md` §3.2); note only, does not gate M14
- [ ] On integration, mark ADR-0045 `Proposed → Accepted`; confirm M14 status stays `Documented` (renumbering
      forbidden from that point, registry rule 4). **2.0 "Concourse" ships at M14's completion.**

## 8. Ready for AntiGravity

- [x] Documents complete
- [x] ADR complete (0045 Proposed; 0018/0019 cited, not re-decided)
- [x] Dependencies verified
- [x] The nine-item exit criterion complete
- [x] **Ready for implementation.** Recommended start: E1 (compiler) → E2 (the Pack), then E7 (schema) → E3/E4
      (Marketplace + install). E8 (the nine-item harness) closes the milestone; **T8.9, the uninstall proof
      (AC6), is the last thing to go green.**

**STOP.** Per the mission, M10–M14 is the scope. This delivery completes the M10–M14 backfill; **do not begin
M15 preparation from here** (M15 is already `Documented`) and **do not begin M17.** Await Principal approval.

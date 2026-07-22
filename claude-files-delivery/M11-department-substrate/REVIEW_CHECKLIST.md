# M11 — Review Checklist

Every item ✓ VERIFIED or ✗ FAILED. Build/test items are ✗ until a toolchain runs them.

## Documents & ADRs
- [x] README, Architecture, Implementation Plan, Review Checklist present
- [x] Governing ADRs mapped (0013, 0014, 0016, 0017); no new ADR required

## Epics complete
- [ ] E1 domain + migrations 0012–0018 + events
- [ ] E2 `sidra-departments` (registrar/org-graph/autoscale/budget/implicit dept)
- [ ] E3 `sidra-registry` (standards/registries/Canon path)
- [ ] E4 Guard Runner (declarative + Wasm)
- [ ] E5 Exchange (routing/resolution/cost/depth/cycle)
- [ ] E6 isolation + invariants I-12…I-17
- [ ] E7 replay equivalence gate

## Acceptance criteria
- [ ] AC1 replay Briefs byte-identical
- [ ] AC2 twelve manifest checks, each naming its rule, no override
- [ ] AC3 implicit department loads; v1 agents resolve with stable IDs
- [ ] AC4 budget sub-ceiling pauses one department (I-14)
- [ ] AC5 Exchange refuses cycles and depth>2 (I-15)
- [ ] AC6 fs (I-12) + memory (I-13) isolation
- [ ] AC7 Standards resolution + violation recording
- [ ] AC8 Guard Runner declarative + Wasm (fuel, no ambient)
- [ ] AC9 migrations forward-only/idempotent; null=v1
- [ ] AC10 nothing Principal-visible (Rail unchanged)

## Exit criteria
- [ ] AC1 green with AC2–AC10 supporting → substrate ready for M12

## Architecture compliance
- [x] Additive only; no event kind/column removed or redefined
- [x] Dependency direction: `sidra-departments`/`sidra-registry` have no edge to orchestrator
- [ ] Build/test/clippy/fmt executed — **✗ NOT VERIFIED (no toolchain)**

**STOP after M14.**

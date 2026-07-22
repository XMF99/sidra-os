# Sidra OS — M10–M14 Delivery Packages · Index

**For the Principal and AntiGravity.** Five complete architecture delivery packages, one per milestone, that
turn the already-designed M10–M14 into implementation-ready packages in the same format as the M15 (Mission
Engine) and M16 (Connector Framework) deliveries. **Architecture and specification only — no production code**,
per the workflow.

| | |
|---|---|
| Covers | M10, M11, M12, M13, M14 |
| Format basis | `claude-files-delivery/M16-connector-framework/` (README → STEP-1 audit → ARCHITECTURE → ADRs → IMPLEMENTATION_PLAN → REVIEW_CHECKLIST) |
| Authoritative sources | `/MILESTONE_REGISTRY.md`, `/MASTER_IMPLEMENTATION_GUIDE.md`, `/docs`, `/docs-v2` |
| Scope boundary | Stops at M14. Does **not** touch M15, M16, or M17. |
| Status | Documented (these packages) · implementation Open |

---

## 1. What these packages are, and what gap they fill

`MILESTONE_REGISTRY.md` marks M10–M16 as **Documented** — the *design* for each already exists in `/docs`
(1.0 "Atrium") and `/docs-v2` (2.0 "Concourse"). What did **not** exist, until now, was a consolidated
**delivery package** for M10–M14 in the form M15 and M16 already have: a single folder that operationalizes
the scattered design into a STEP-1 gate audit, an architecture document, the ADRs the milestone originates,
an epic→task→subtask implementation plan, and a review checklist an implementer can execute without asking
questions.

**These packages consolidate and operationalize the existing authoritative design. They invent no new
architecture that competes with `/docs` or `/docs-v2`.** Where a source was silent on an operational detail,
the minimal necessary decision was made and recorded as an ADR (numbered 0038–0045; §4). The single source of
truth is unchanged: where any package disagrees with `/docs`, the v1 document governs; where it disagrees with
the registry about a milestone's meaning, the registry governs.

## 2. Build order and dependency chain

```
M10 ── Hardening & 1.0 ────────► 1.0 "Atrium" ships (feature-complete at M9, proven at M10)
        │  (release hardening only; no new features, no new crate, no new migration)
        ▼
M11 ── Department substrate ──── gates M12–M14 absolutely (invisible; replay-equivalence green)
        ▼
M12 ── Structure ──────────────  eight Divisions, four Offices, firm-wide vetoes (visible skeleton)
        ▼
M13 ── Departments ───────────── Packs install; Registrar + Exchange + Standards + Guards (the substrate M16 grants against)
        ▼
M14 ── Game Studio & Marketplace ► 2.0 "Concourse" ships (the department model proven on a real external body of work)
```

`M11` gates everything after it: building visible structure (M12) before the invisible substrate is the one
ordering mistake that converts the 2.0 migration into a rewrite (`MASTER_IMPLEMENTATION_GUIDE.md` §5). `M13`'s
Registrar is exactly what `M16`'s connector grants resolve against — so M13 must land before M16 can be
certified (`claude-files-delivery/M16-VERIFICATION-AUDIT.md`, STOP-2).

## 3. Exit criteria (the contract per milestone)

| M | Package | Exit criterion (from `MILESTONE_REGISTRY.md`) |
|---|---|---|
| M10 | `M10-hardening-and-1.0/` | Thirty days dogfooding, zero data loss, zero unlogged effects |
| M11 | `M11-department-substrate/` | The replay-equivalence test is green; the Firm runs as one implicit department, byte-identical |
| M12 | `M12-structure/` | Eight Divisions, four Offices, the Rail shows Divisions, a veto blocks firm-wide — proven by test |
| M13 | `M13-departments/` | Three departments installed from Packs, one Exchange request end to end |
| M14 | `M14-game-studio-and-marketplace/` | The nine-item acceptance list, including uninstall-leaves-Firm-working |

Each package's implementation plan makes its exit criterion the **last epic's final task and the last thing to
go green**, decomposed into named, objectively testable acceptance criteria.

## 4. ADR map — contiguous 0038–0045

Numbering continues the global sequence after ADR-0037 (the last M16 ADR). New ADRs were written **only** for
decisions the sources leave genuinely open; everything already recorded in ADRs 0001–0037 is consumed, not
re-decided. All eight are `Proposed` and become `Accepted` on Principal approval.

| ADR | Package | Decision |
|---|---|---|
| 0038 | M10 | The 1.0 release gate is a proof obligation, not a date |
| 0039 | M10 | Hardening adds no authoritative tables; release bookkeeping is a projection |
| 0040 | M11 | The implicit default department as the migration bridge |
| 0041 | M11 | Replay equivalence as the substrate's exit gate |
| 0042 | M12 | A firm-wide veto is enforced as a non-downgradable blocking Guard at the choke point |
| 0043 | M13 | Exchange contract resolution is deterministic; ambiguity is refused |
| 0044 | M13 | The exit-criterion conformance set is Backend, Cybersecurity, Software Engineering |
| 0045 | M14 | The Marketplace is distribution-only; it reuses the M13 install path |

## 5. Migration map — no collisions, forward-only

The store's migrations are forward-only and additive (`/docs/04-database-design.md` §10). The bands are:

| Band | Owner | Notes |
|---|---|---|
| `0001` | v1 base (M2–M9) | the "Atrium" core schema |
| — | **M10** | **no new migration** — hardening adds no authoritative tables (ADR-0039) |
| `0002`–`0006` | **M11** | department scoping, the implicit default department, the fourth budget ceiling, replay fixtures |
| `0007`–`0010` | **M12** | divisions, offices, veto records, division executives |
| `0011`–`0015` | **M13** | department packs, registrar, exchange, standards, guards, registries |
| `0016`–`0018` | **M14** | marketplace listings, game-studio pack install records |
| `0019`–`0024` | M15 (existing) | mission engine — **not touched** |
| `0025`–`0029` | M16 (existing) | connector framework — **not touched** |

M10–M14 occupy `0002`–`0018`, entirely below the M15/M16 range, so nothing already committed is disturbed.

## 6. New crates

| Milestone | Crate change |
|---|---|
| M10 | none — additions to `infrastructure/ci/` and `infrastructure/testing/` only |
| M11 | `services/departments` (`sidra-departments`) — the boundary primitive / substrate |
| M12 | none — Divisions/Offices are structures over the M11 substrate and existing crates |
| M13 | `sidra-departments` extended (Registrar, Standards Engine, Guard Runner); the Exchange lives in `sidra-orchestrator` because a cross-department request **is** a Work Order (dependency-direction, ADR-0011) |
| M14 | none in the kernel — the Game Studio is a Department Pack (data) installed via M13; Marketplace is distribution-only (ADR-0045) |

Dependency direction (`packages/domain ← services/* ← apps/*`) holds throughout and is CI-enforced; no new
crate depends on `sidra-orchestrator`/`sidra-mission` against the rule.

## 7. Integration notes (for AntiGravity)

- Each package's ADRs live in its `adr/` folder. On approval: copy all eight into `docs-v2/adr/`, add their
  rows to `docs-v2/adr/README.md`, and mark them `Accepted`. Numbering is already contiguous (0038–0045) — no
  reconciliation needed.
- On completing each milestone's implementation, update its `MILESTONE_REGISTRY.md` status; the number is
  permanent from that point (registry rule 4).
- Migrations are additive and independently deployable; each ships a test against a prior-release fixture Vault.
- The permanent CI gates from `MASTER_IMPLEMENTATION_GUIDE.md` §7 apply — in particular the kernel-neutrality
  grep (from M11) and the Guard-corpus gate (from M13).

## 8. Scope discipline — where this stops

These packages cover **M10 through M14 only**. Per the delivery brief and the registry:

- **M15 (Mission Engine)** and **M16 (Connector Framework)** are already Documented and delivered; nothing here
  modifies them.
- **Do not begin M17.** M17 is `Defined`, not `Documented`, and depends on M16 being implemented and its
  exit-criterion test green.

**STOP — await Principal approval before implementation proceeds, milestone by milestone.**

# Sidra OS — Architecture Delivery Index (complete, M1–M30)

**The index of every architecture delivery package.** The authoritative definition of every milestone is
`/MILESTONE_REGISTRY.md`; where this index disagrees, the registry governs.

| | |
|---|---|
| Programme | M1 – M30 |
| Documented (architecture + plan) | **M1 – M30 — complete** |
| Remaining to architect | **none** |
| Standard | Architecture + specification only — no production code |
| Companion documents | `MILESTONE-DEPENDENCY-MAP.md` · `IMPLEMENTATION-ROADMAP.md` · `ARCHITECTURE-COMPLETENESS-AUDIT.md` |

---

## 1. Status by release

- **1.0 "Atrium" — M1–M10.** M1–M9 in `/docs`; `M10-hardening-and-1.0/`.
- **2.0 "Concourse" — M11–M15.** `M11-department-substrate/`, `M12-structure/`, `M13-departments/`,
  `M14-game-studio-and-marketplace/`; **M15 (Mission Engine)** in `docs-v2/03-Intelligence/`.
- **2.5 "Field" — M16–M20.** `M16-connector-framework/` (earlier) + `M17-first-party-connector-suite/`,
  `M18-companion/`, `M19-voice-directive/`, `M20-executable-artifacts/`.
- **3.0 "Chambers" — M21–M25.** `M21-seats-and-identity/`, `M22-delegation-and-separation-of-duties/`,
  `M23-kernel-extraction/`, `M24-sync-and-conflict-resolution/`, `M25-firm-templates-and-portability/`.
- **4.0 "Continuum" — M26–M30.** `M26-outcome-calibration/`, `M27-charter-evolution/`,
  `M28-procedural-compilation/`, `M29-firm-self-review/`, `M30-continuum-hardening-and-4.0/`.

## 2. Package inventory (this backfill: M10, M17–M30 as delivery packages)

| M | Package | Exit criterion |
|---|---|---|
| M10 | `M10-hardening-and-1.0/` | 30-day dogfood, zero data loss, zero unlogged effects |
| M11 | `M11-department-substrate/` | Replay-equivalence green; one implicit department, byte-identical |
| M12 | `M12-structure/` | 8 Divisions, 4 Offices, Rail shows Divisions, veto firm-wide |
| M13 | `M13-departments/` | Three Packs install; one Exchange request end to end |
| M14 | `M14-game-studio-and-marketplace/` | Nine-item list incl. uninstall-leaves-Firm-working |
| M17 | `M17-first-party-connector-suite/` | Five connectors pass conformance; per-dept grantable; offline-safe |
| M18 | `M18-companion/` | Clear a day's approvals from a phone with no desktop; Brief identical |
| M19 | `M19-voice-directive/` | Spoken Directive → same Mandate as typed; audio never leaves device |
| M20 | `M20-executable-artifacts/` | Agent-authored artifact executes, bounded ≤ its Work Order grant |
| M21 | `M21-seats-and-identity/` | A second Seat created; every event distinguishes the two; no history rewritten |
| M22 | `M22-delegation-and-separation-of-duties/` | A Seat's own request cannot be self-approved; refusal structural |
| M23 | `M23-kernel-extraction/` | Kernel headless; desktop is one client; no file moved, no import rewritten |
| M24 | `M24-sync-and-conflict-resolution/` | Diverge and converge; no lost event, no silent overwrite; conflicts as Decisions |
| M25 | `M25-firm-templates-and-portability/` | A Firm Template installs into an empty Vault, structure without data |
| M26 | `M26-outcome-calibration/` | Estimate error narrows over 50 Missions; inspectable and revertible |
| M27 | `M27-charter-evolution/` | A regressing charter revision is refused; an accepted one is a Principal Decision |
| M28 | `M28-procedural-compilation/` | A procedure repeated 5× is proposed as a Workflow citing its Missions |
| M29 | `M29-firm-self-review/` | Department-health assessment with the absorbability test; propose, never enact |
| M30 | `M30-continuum-hardening-and-4.0/` | No evolution path escalates without a Principal Decision; 90-day dogfood |

Each package: `README`, `00-M{n-1}-AUDIT` (STEP-1 gate), architecture spec, `IMPLEMENTATION_PLAN`
(epics → tasks → subtasks), `REVIEW_CHECKLIST`, `adr/`.

## 3. ADR map — contiguous 0038–0079 (42 new records; continuing after the repo's 0037)

| Range | Milestone | Range | Milestone |
|---|---|---|---|
| 0038–0039 | M10 | 0057–0059 | M21 |
| 0040–0041 | M11 | 0060–0061 | M22 |
| 0042 | M12 | 0062–0063 | M23 |
| 0043–0044 | M13 | 0064–0066 | M24 |
| 0045 | M14 | 0067–0068 | M25 |
| 0046–0048 | M17 | 0069–0071 | M26 |
| 0049–0051 | M18 | 0072–0073 | M27 |
| 0052–0053 | M19 | 0074–0075 | M28 |
| 0054–0056 | M20 | 0076–0077 | M29 |
| | | 0078–0079 | M30 |

All `Proposed`; `Accepted` on Principal approval. 0038–0044 already merged into `docs-v2/adr/README.md`.

## 4. Migration map — forward-only, below nothing already committed

`0001` base · `0002`–`0015` M11–M13 (in repo) · `0016`–`0018` M14 · `0019`–`0024` M15 · `0025`–`0029` M16
(V25–V29) · `0030` M17 · `0033`–`0036` M18 · `0037`–`0038` M19 · `0039`–`0041` M20 · `0042`–`0046` M21 ·
`0047`–`0048` M22 · `0049` M23 · `0050`–`0053` M24 · `0054`–`0056` M25 · `0057`–`0060` M26 · `0061`–`0063`
M27 · `0064`–`0066` M28 · `0067`–`0069` M29 · M30 none (hardening; ADR-0039/0078 precedent).

`0031`–`0032` are an intentional, harmless unused gap (M17's band was 0030–0031; M17 used only `0030`). Left
as-is: migration numbers are forward-only version stamps, and closing a two-number cosmetic gap across fifteen
packages would be churn with no functional benefit. Noted in the completeness audit.

## 5. Where the architecture is complete

M1–M30 all have an architecture and an implementation plan. M1–M9 in `/docs`; M15 in `docs-v2/03-Intelligence/`;
M16 and M10–M14 + M17–M30 as `claude-files-delivery/` packages. **No milestone is un-architected.** See
`ARCHITECTURE-COMPLETENESS-AUDIT.md` for the full verdict.

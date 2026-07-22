# Sidra OS — Architecture Delivery Index (living)

**The running index of every architecture delivery package.** Updated as each milestone is delivered. The
authoritative definition of every milestone is `/MILESTONE_REGISTRY.md`; where this index disagrees, the
registry governs.

| | |
|---|---|
| Programme | M1 – M30 |
| Documented (architecture + plan) | M1 – M25 |
| Remaining to architect | M26 – M30 (4.0 "Continuum") |
| Standard | Architecture + specification only — no production code |

---

## 1. Status by release

- **1.0 "Atrium" — M1–M10.** M1–M9 in `/docs`; `M10-hardening-and-1.0/` package.
- **2.0 "Concourse" — M11–M15.** Packages `M11-department-substrate/`, `M12-structure/`, `M13-departments/`,
  `M14-game-studio-and-marketplace/`; **M15 (Mission Engine)** in `docs-v2/03-Intelligence/`.
- **2.5 "Field" — M16–M20.** `M16-connector-framework/` (earlier) + `M17-first-party-connector-suite/`,
  `M18-companion/`, `M19-voice-directive/`, `M20-executable-artifacts/`.
- **3.0 "Chambers" — M21–M25.** `M21-seats-and-identity/`, `M22-delegation-and-separation-of-duties/`,
  `M23-kernel-extraction/`, `M24-sync-and-conflict-resolution/`, `M25-firm-templates-and-portability/`.
- **4.0 "Continuum" — M26–M30.** **Pending** — being produced sequentially.

## 2. Delivery-package inventory (this backfill, M10 onward)

| M | Package | Exit criterion | Arch |
|---|---|---|---|
| M10 | `M10-hardening-and-1.0/` | 30-day dogfood, zero data loss, zero unlogged effects | 56 KB |
| M11 | `M11-department-substrate/` | Replay-equivalence green; one implicit department, byte-identical | 54 KB |
| M12 | `M12-structure/` | 8 Divisions, 4 Offices, Rail shows Divisions, veto firm-wide | 62 KB |
| M13 | `M13-departments/` | Three Packs install; one Exchange request end to end | 64 KB |
| M14 | `M14-game-studio-and-marketplace/` | Nine-item list incl. uninstall-leaves-Firm-working | 66 KB |
| M17 | `M17-first-party-connector-suite/` | Five connectors pass conformance; per-dept grantable; offline-safe | 65 KB |
| M18 | `M18-companion/` | Clear a day's approvals from a phone with no desktop; Brief identical | 63 KB |
| M19 | `M19-voice-directive/` | Spoken Directive → same Mandate as typed; audio never leaves device | 65 KB |
| M20 | `M20-executable-artifacts/` | Agent-authored artifact executes, bounded ≤ its Work Order grant | 65 KB |
| M21 | `M21-seats-and-identity/` | A second Seat created; every event distinguishes the two; no history rewritten | 64 KB |
| M22 | `M22-delegation-and-separation-of-duties/` | A Seat's own request cannot be self-approved; refusal is structural | 66 KB |
| M23 | `M23-kernel-extraction/` | Kernel runs headless; desktop is one client; no file moved, no import rewritten | 75 KB |
| M24 | `M24-sync-and-conflict-resolution/` | Two devices diverge and converge; no lost event, no silent overwrite; conflicts as Decisions | 75 KB |
| M25 | `M25-firm-templates-and-portability/` | A Firm Template installs into an empty Vault reproducing structure without data | 74 KB |

Each package: `README`, `00-M{n-1}-AUDIT` (STEP-1 gate), architecture spec, `IMPLEMENTATION_PLAN`
(epics → tasks → subtasks), `REVIEW_CHECKLIST`, `adr/`.

## 3. ADR map (contiguous, continuing after the repo's 0037)

| Range | Milestone(s) |
|---|---|
| 0038–0039 M10 · 0040–0041 M11 · 0042 M12 · 0043–0044 M13 · 0045 M14 | 1.0/2.0 |
| 0046–0048 M17 · 0049–0051 M18 · 0052–0053 M19 · 0054–0056 M20 | 2.5 |
| 0057–0059 M21 · 0060–0061 M22 · 0062–0063 M23 · 0064–0066 M24 · 0067–0068 M25 | 3.0 |
| 0069+ | M26–M30 (pending) |

All `Proposed`; become `Accepted` on Principal approval. (0038–0044 already merged into
`docs-v2/adr/README.md`; 0045+ pending integration.)

## 4. Migration map (forward-only; below nothing already committed)

| Band | Owner |
|---|---|
| `0001` v1 base · `0002`–`0015` M11–M13 (files present) · `0016`–`0018` M14 · `0019`–`0024` M15 · `0025`–`0029` M16 | 1.0–2.0 |
| `0030` M17 · `0033`–`0036` M18 · `0037`–`0038` M19 · `0039`–`0041` M20 | 2.5 |
| `0042`–`0046` M21 · `0047`–`0048` M22 · `0049` M23 · `0050`–`0053` M24 · `0054`–`0056` M25 | 3.0 |
| `0057`+ | M26–M30 (pending) |

Migration numbers are compacted to a fully contiguous sequence in the final consistency pass once M30 lands
(one small gap remains at `0031`–`0032`, reserved by M17's band and unused).

## 5. Build order (2.5 + 3.0)

```
2.5  M16 framework ─► M17 suite ─► M18 companion ─► M19 voice ─► M20 executable artifacts ─► 2.5 ships
3.0  M21 seats ─► M22 separation of duties ─► M23 kernel extraction ─► M24 sync ─► M25 firm templates ─► 3.0 ships
```

Registry dependencies: M17→M16; M18→M10+M15; M19→M18+M6; M20→M9+M16; M21→M2+ADR-0021; M22→M21; M23→M11+M21;
M24→M23; M25→M14+M21.

## 6. What remains

**M26–M30 — 4.0 "Continuum":** Outcome Calibration, Charter Evolution, Procedural Compilation, Firm
Self-Review, Continuum Hardening. Every 4.0 milestone is gated by evaluation sets and may propose, never enact,
without a Principal Decision. On completion this index is finalized alongside a milestone dependency map, an
implementation roadmap, and a full architecture completeness audit (M1–M30).

# Deliverable 11 — Risk Analysis

Risks to Desktop Alpha Sprint 1, scored **Likelihood × Impact** (L/M/H), each
with a mitigation and an owner-of-decision. Risks are ordered by exposure. The
dominant theme, learned directly from the M1–M30 audits, is: **do not let the UI
paper over backend gaps** — degrade visibly, never fake.

---

## R1 — IPC read-model coverage is thinner than assumed (L: H · I: H) — top risk
The Contract Register (`01 §6.2`) is an *assumption*; the real `ipc.rs` may not
expose several read models (Projects aggregate, `analytics.dailySummary`,
`missions.replay`, `permissions.forActor`, `search.global`).
- **Consequence if unmanaged:** UI either blocks or, worse, fabricates data —
  repeating the platform's "fake it green" failure (audit F4/F7).
- **Mitigation:** Epic 0 reconciles the register *before any page*; MISSING →
  labeled **degraded** UI + a filed backend follow-up (`20`); never a client
  fabrication. Acceptance F3 enforces this.
- **Decision owner:** Architecture Authority (accept degraded scope per page).

## R2 — No event tail / weak change signal (L: M · I: H)
If `events.tail` doesn't exist, the "UI as live follower" model loses its engine.
- **Consequence:** stale UI or heavy polling.
- **Mitigation:** build the **interval-fallback path first** (Epic 0 T0.4) so the
  UI is correct without the tail; file a follow-up to add the tail; the design
  already treats tail-loss as a first-class state (`15 §3`). Compliance is
  unaffected; only freshness/UX.
- **Owner:** Backend follow-up + Architecture Authority.

## R3 — Cheap read-only permission checks unavailable (L: M · I: M)
Affordance states (ADR-0085) need a fast `permissions.forActor`/`check`.
- **Consequence:** everything collapses to "explain-on-attempt" (works, but users
  hit more denials).
- **Mitigation:** design already supports the fallback; file a follow-up for a
  batch capability query; **security is never weakened** (server still enforces).
- **Owner:** Backend follow-up.

## R4 — Scope creep: the shell becomes a place to "fix" backend gaps (L: M · I: H)
The strongest temptation is to add a table, a client computation, or a bypass to
make a page feel complete.
- **Consequence:** a direct violation of ADR-0002/0006/0011 — exactly the class of
  failure the audits spent three passes unwinding.
- **Mitigation:** hard boundary in `01 §12` + the STEP-1 gate (`01` Appendix A); every "just add…"
  becomes a follow-up ticket, not a UI shortcut; the Architecture Audit (`18 §2`)
  sweeps for the analogues.
- **Owner:** Architecture Authority (reject at review).

## R5 — Webview rendering variance across platforms (L: M · I: M)
Tauri uses WebView2 / WKWebView / WebKitGTK, not one Chromium.
- **Consequence:** visual/behavioral drift, esp. CSS features, focus, and RTL.
- **Mitigation:** validate the design system on all three engines early (Epic 1);
  prefer well-supported CSS; the `06` token approach + logical properties reduce
  divergence; a11y pass covers focus behavior per engine.
- **Owner:** Antigravity.

## R6 — Accessibility & RTL treated as polish, done last (L: M · I: M)
Arabic-first + AA is a Sprint-1 requirement, not a stretch.
- **Consequence:** costly rework if bolted on at the end.
- **Mitigation:** tokens/logical-properties from Epic 1; keyboard/focus baked into
  every component in Epic 2; contrast validator in CI; a11y is a per-task DoD gate,
  with a final pass in Epic 11.
- **Owner:** Antigravity.

## R7 — Performance regressions on data-heavy pages (Event Log, DataGrid) (L: M · I: M)
Large event/mission lists can jank.
- **Consequence:** misses the "usable desktop app" goal.
- **Mitigation:** virtualized `DataGrid`, windowed queries/pagination, per-widget
  suspense so nothing blocks chrome, and explicit budgets (below). Measure in
  Epic 11 T11.4.
- **Owner:** Antigravity.

## R8 — Optimistic UI drifts from the log (L: L · I: M)
An optimistic patch not reconciled by the tail leaves a phantom state.
- **Consequence:** UI shows something the log doesn't.
- **Mitigation:** optimistic updates are opt-in, snapshot+rollback, and *must*
  reconcile against the tail-matched correlationId (`08 §5`, `15 §2`); default is
  non-optimistic for anything ambiguous.
- **Owner:** Antigravity.

## R9 — Secret leakage into the renderer (L: L · I: H)
A DTO or diagnostic accidentally carries credential material.
- **Consequence:** violates ADR-0034; serious.
- **Mitigation:** connectors DTOs are metadata-only by contract; CSP + IPC
  allow-list; an inspection gate (A7) in the audit; diagnostics scrub secrets.
- **Owner:** Architecture Authority + Antigravity.

## R10 — Existing `apps/desktop/src` "rooms" conflict with the new structure (L: M · I: L)
The current skeleton may collide with `app/`+`pages/`.
- **Consequence:** merge friction, dead code.
- **Mitigation:** Epic 0 inventories existing UI; `20-migration-notes.md`
  specifies replacing `rooms/` incrementally, page by page, keeping the app
  buildable throughout.
- **Owner:** Antigravity.

## R11 — Router/store/CSS already chosen in the repo differs from the ADRs (L: M · I: L)
The existing app may already import a router/store/styling lib.
- **Consequence:** two ways to do the same thing.
- **Mitigation:** ADR ratification note (`01 §13`) — **existing choice governs**;
  amend ADR-0080/82/83/84 to match reality rather than churn the code.
- **Owner:** Architecture Authority.

---

## Performance budgets (targets for Epic 11; ratify exact numbers with the Principal)

| Surface | Budget |
|---|---|
| Cold start → interactive Dashboard chrome | ≤ 1.5 s |
| Dashboard all-widgets settled (warm cache) | ≤ 1.0 s |
| Route change (page swap) | ≤ 150 ms to first paint |
| Command palette / search open | ≤ 100 ms |
| Event Log scroll (virtualized, 10k+ rows) | ≥ 60 fps, no dropped input |
| Idle CPU (no missions running) | negligible; no busy-poll |

These mirror the platform's "budgets are gates" posture (M8) — carried into the
UI as measured checks, not aspirations.

---

## Risk posture summary

The **highest-exposure risks are all "backend thinner than assumed"** (R1–R3) and
the **highest-severity risk is scope creep into a bypass** (R4). The entire
package is structured to make the safe choice the easy one: degrade visibly, file
a follow-up, never fake — because the project's own audit history shows that
faking completeness is the failure that costs the most to unwind.

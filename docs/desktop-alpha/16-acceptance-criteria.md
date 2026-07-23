# Deliverable 8 — Acceptance Criteria (Consolidated)

The single testable contract for Sprint 1. Each criterion is objective and maps
to its spec. A criterion is met only with a demonstration (interaction, test, or
inspection). Grouped by area; IDs are stable for the checklist (`17`) and audit
(`18`).

Legend for **Verify by**: **D** demo/interaction · **T** automated test ·
**I** code/inspection · **A** accessibility tooling.

---

## A. Architecture & invariants (non-negotiable)

| ID | Criterion | Verify |
|---|---|---|
| A1 | Every displayed value derives from an IPC query DTO (a projection of the log); no UI-local store holds domain truth. | I,T |
| A2 | Every mutation is an IPC command that passes the Permission Broker server-side; the UI never authorizes. | I,T |
| A3 | The UI adds no crate, migration, schema, or existing-ADR change; all new files are under `apps/desktop/`. | I |
| A4 | The event tail drives cache invalidation; no polling in the steady state. | D,I |
| A5 | Event Log and Replay surfaces are strictly read-only (no edit/delete/reorder anywhere). | I,D |
| A6 | No telemetry/analytics/beacon call exists; only existing connector egress + signed-update channel. | I |
| A7 | No credential/secret value is ever present in any renderer surface. | I |
| A8 | The dependency direction holds: the UI's only inbound edge is the IPC contract; no `services/* → apps/*` edge. | I |

## B. App shell

| ID | Criterion | Verify |
|---|---|---|
| B1 | Chrome (title/side/top/status) mounts once and never unmounts across navigation. | D |
| B2 | Sidebar reflects active route, collapses with persistence, hides structurally-unavailable destinations, exposes `g`-jumps. | D |
| B3 | Status bar shows live vault health, tail state, running mission/agent counts, sync — updated by the tail. | D |
| B4 | ⌘K, ⌘/, ⌘⇧N open palette/search/notifications; Esc/Back closes the top overlay before navigating. | D |
| B5 | Theme (light/dark/system), density, and direction (LTR/RTL) switch live with correct contrast in both themes. | D,A |
| B6 | Every data surface renders the five-state contract; one widget failure never blanks the shell. | D,T |
| B7 | All global shortcuts have pointer equivalents; `?` lists them. | D,A |

## C. Pages (per-page acceptance from `03`)

| ID | Criterion | Verify |
|---|---|---|
| C1 | Dashboard reaches interactive within budget, chrome-first, widgets resolving independently; every drill-down lands on the correct filtered page. | D |
| C2 | Mission Center: create→appears in one tail cycle; lifecycle/actions are the engine's; author cannot approve own (disabled+reason); replay is read-only driver output; delegation broker-gated. | D,T |
| C3 | Organization: exactly 8 Divisions + 4 Offices from read models; firm-wide veto shown as non-downgradable; proposals are propose-only; no UI enacts structure without a Principal Decision. | D,I |
| C4 | Departments: real standards/guards; Exchange request shows deterministic resolution/refusal; uninstall communicates "leaves Firm working"; guard blocks display reason. | D |
| C5 | Agents: status is orchestrator's (not fabricated); idle vs active distinguished; activity deep-links; no spawn/destroy affordance. | D,I |
| C6 | Projects: real counts; pin persists + reflects on Dashboard/sidebar; degrades to tag-composition if aggregate MISSING. | D |
| C7 | Knowledge: engine-ranked results with provenance; visibility-scoped; no client re-rank presented as the answer. | D,I |
| C8 | Connectors: no credential in any view; grant scoped to one target; egress read-only; grant/revoke broker-gated. | D,I |
| C9 | Analytics: all series from local projections; no network analytics; theme + reduced-motion honored. | D,I |
| C10 | Event Log: read-only; integrity badge = host `verify_chain`; correlation-follow coherent; live via tail; export = current view. | D,I |
| C11 | Settings: appearance changes live + persist; no setting mutates platform truth; identity read-only; diagnostics expose no secrets. | D,I |

## D. Design system & accessibility

| ID | Criterion | Verify |
|---|---|---|
| D1 | All styling uses design tokens; no hard-coded colors/sizes in components. | I |
| D2 | Contrast meets WCAG 2.1 AA in light and dark (validator green). | A,T |
| D3 | Keyboard-complete: every action reachable/operable by keyboard; visible focus ring never suppressed. | A,D |
| D4 | Overlays trap and restore focus; route change moves focus to page heading; skip-to-content present. | A,D |
| D5 | Reduced-motion honored; interactive targets ≥ 24×24 (≥32 primary) in both densities. | A |
| D6 | RTL is correct (logical properties); Arabic renders/shapes correctly. | D,A |

## E. State, routing, data

| ID | Criterion | Verify |
|---|---|---|
| E1 | Two views of the same entity update together on the same tail event. | D,T |
| E2 | Optimistic mutations roll back on error/denial and reconcile on the tail. | T |
| E3 | Preferences persist across restart; deleting the preferences file yields defaults, not a crash. | D,T |
| E4 | On tail loss the app switches to interval fallback, signals it, and fully re-syncs on reconnect. | D,T |
| E5 | Every page/overlay is deep-linkable and typed; chrome never unmounts; Back dismisses overlays first; list filters survive detail round-trips. | D |
| E6 | A deep link to an unpermitted entity shows an explanation view, never a crash/blank. | D |

## F. Errors & recovery (from `10 §8–§9`)

| ID | Criterion | Verify |
|---|---|---|
| F1 | Permission denial renders as an explanation (not an error), with no state change. | D |
| F2 | Widget error isolates to an inline card + retry + copyable correlationId; siblings stay live. | D |
| F3 | MISSING read model degrades to a neutral panel + note; a follow-up ticket exists. | D,I |
| F4 | Service/command error → toast + inline + correlationId + optimistic rollback. | D |
| F5 | Vault-unreachable-at-boot → full-screen recoverable error with retry/diagnostics (never a blank window). | D |
| F6 | A denied action becomes enabled without reload once a seat/delegation event arrives. | D,T |

## G. Sprint-1 exit (the contract)

| ID | Criterion | Verify |
|---|---|---|
| G1 | All 11 pages render from IPC read models. | D |
| G2 | Every mutation is broker-gated; SoD (author-never-approves-own) demonstrably holds. | D,T |
| G3 | The tail drives invalidation; no UI-local authoritative state. | I,T |
| G4 | Degradation, error, and recovery behaviors all work. | D |
| G5 | The Architecture Audit (`18`) is green and the Implementation Checklist (`17`) is complete. | I |

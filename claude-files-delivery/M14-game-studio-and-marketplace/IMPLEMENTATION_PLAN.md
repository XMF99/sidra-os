# Game Studio and Marketplace — Implementation Plan

**Milestone M14 · the Game Studio Pack + the Marketplace · for AntiGravity**

| | |
|---|---|
| Architecture | `GAME_STUDIO_AND_MARKETPLACE_ARCHITECTURE.md` (this package) — decides behaviour |
| ADRs | 0018 (Review Intensity) · 0019 (compile-don't-embed) · **0045** (Marketplace is distribution-only, Proposed, this package) |
| Kernel crate | **None new.** Pack = data in `departments/game-development/`; compiler = build-time script in `infrastructure/scripts/ccgs-compile/`; distribution wiring reuses `sidra-departments` + `sidra-plugins` |
| Depends on | M13 (Registrar, twelve install checks, Retired phase), M12 (Divisions/Offices), M11 (the six primitives), M9 (signing chain, Wasm host) |
| Must not | add a thirteenth department install check; add department-specific kernel logic; add a Marketplace-private install path (ADR-0045; `/MASTER_IMPLEMENTATION_GUIDE.md` §3.12) |

---

## 0. How to use this document

### 0.1 Relationship to the architecture

The architecture decides *what is true*; this plan decides *what to build and in what order*. Where this plan
appears to contradict the architecture, the architecture is right and this plan is a defect to report. No task
here re-opens an ADR. **This package contains no production code** — this plan is the specification AntiGravity
implements.

### 0.2 Task conventions (inherited from the M16 plan §0.2, unchanged)

- **One task = one commit = one review.** A task that cannot be reviewed in one sitting is too large; split it
  before starting.
- **Complexity is reviewer load, not calendar time.** **S** ≈ under 200 lines / one concept · **M** ≈ 200–600
  lines or one concept with real edge cases · **L** ≈ 600+ lines or cross-module. **There are no XL tasks.**
- **Every task ships its own tests.** No "tests follow later." A task without tests is not done.
- **Every task leaves `main` green.** Feature-flag if incomplete; never break the build.
- **The compiler and the Pack are data/build-time, not runtime.** No task adds a kernel code path that names
  the Game Studio (CI-enforced, AC-K1).

### 0.3 Epic map

| Epic | Name | Delivers |
|---|---|---|
| E1 | CCGS → Pack compilation mapping | the maintained compiler + the field-by-field mappings and the judgement-call register |
| E2 | The Game Studio department Pack (as data) | 49 archetypes, 73 playbooks, 11 standards, 12 guards, 2 registries, templates, stage model, manifest, defaults |
| E3 | The Marketplace: publish / discover / acquire | the working local publisher and the catalogue; acquire = download + verify (ADR-0045) |
| E4 | Install via the M13 machinery | delegate to the Registrar's twelve checks; the three acts; grant as a separate Decision |
| E5 | Review Intensity setting | the Game Studio default (`standard`) + per-Engagement/per-department override; author ≠ reviewer preserved |
| E6 | Licence / attribution enforcement | `PROVENANCE.md`, MIT text, origin line, `derived_from` — the compiler output check + publish gate |
| E7 | Migrations 0016–0018 + events | additive projections; the distribution/lifecycle event variants |
| E8 | The nine-item acceptance harness (incl. uninstall) | the exit criterion — **the last thing to go green** |

### 0.4 Recommended implementation order

```
E1 ──► E2 ──► E7 ──► E3 ──► E4 ──► E8
              ▲
   E5, E6 ────┘   (E5 rides on E2's manifest/defaults; E6 rides on E1's compiler output + E3's publish gate)
```

E1 first (the compiler is how the Pack comes to exist). E2 produces the Pack data from E1's mappings. E7 lands
the schema just ahead of E3/E4's writes. E3 is the publisher + catalogue + acquire. E4 wires acquire→install
(via M13) →grant. E5 and E6 attach to E2/E3 (the default and the attribution gates). E8 assembles the
nine-item harness; **its final task is the uninstall proof (AC6) and it is the last thing green** — the exit
criterion.

---

## E1 — CCGS → Pack compilation mapping

### Purpose
The maintained compiler and the field-by-field mappings that turn CCGS assets into Sidra Pack artifacts, with
provenance — the mechanism ADR-0019 chose over embedding.

### Scope
In: the compiler in `infrastructure/scripts/ccgs-compile/`; the agent/skill/rule/hook/registry mappings; the
judgement-call register (`Bash`, escalation targets, `AskUserQuestion`). Out: the Pack *content* itself (E2 —
E1 produces the transforms, E2 runs them and reviews the diff); attribution enforcement (E6).

### Dependencies
CCGS source at a pinned commit; `/docs-v2/03-integration-plan.md` §2–§6 (the mappings).

### Public APIs
`compile_agent(md) -> RoleArchetype`, `compile_skill(skill) -> Playbook`, `compile_rule(md) -> Standard`,
`compile_hook(sh) -> GuardSpec | WasmGuard | Deleted`, `compile_registry(yaml) -> Registry`. Every output
carries `derived_from`.

### Acceptance criteria
Each mapping is field-by-field per the integration plan; `Bash` never maps to a shell capability; every output
carries `derived_from`; the compiler is re-runnable and produces a reviewable diff.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T1.1** | Scaffold the compiler: CLI, source-commit pinning, `derived_from` stamping, diff output | S | — | `infrastructure/scripts/ccgs-compile/` | Runs against a pinned commit; every output stamped `derived_from`; re-run produces a diff, not a fresh tree |
| **T1.2** | Agent → Role Archetype mapping (field-by-field, `/docs-v2/03-integration-plan.md` §2) | M | T1.1 | `ccgs-compile/agents.rs` | `name/description/model/maxTurns/skills/memory` map per the table; ten-section spec satisfied |
| **T1.3** | The `Bash` judgement register: 16 agents that declared `Bash` get an explicit per-agent capability decision (default: none) | M | T1.2 | `ccgs-compile/bash_register.toml` | `Bash` never maps to a shell capability; each of the 16 has a recorded decision (`tool:code-analysis`/`tool:build-invoke`/none) (§3.3) |
| **T1.4** | Escalation + `AskUserQuestion` rewrite: "the user"→"the Principal"; classify each `AskUserQuestion` as Approval Request or Clarification | M | T1.2 | `ccgs-compile/escalation.rs` | Every escalation target resolves to Lyra or an Exchange contract; each `AskUserQuestion` occurrence classified (§3.3) |
| **T1.5** | Skill → Playbook mapping; `team-*` → Workflow DAG nodes; gate-ID references → gate table | M | T1.1 | `ccgs-compile/skills.rs` | 73 skills compile as valid DAGs; nine `team-*` become parallel-phase DAGs (`/docs-v2/03-integration-plan.md` §3) |
| **T1.6** | Rule → Standard + hook → Guard (three-tier classification) | M | T1.1 | `ccgs-compile/rules.rs`, `hooks.rs` | 11 rules → path-scoped Standards; 12 hooks classified 7 declarative / 3 Wasm / 2 deleted (§4.5) |
| **T1.7** | Registry adoption (`source`→`owner`; append-only header; `written_by`/`read_by` fields) | S | T1.1 | `ccgs-compile/registries.rs` | 2 registries adopted, semantics intact; owner field present; append-only (§4.6; `/docs-v2/03-integration-plan.md` §6) |

---

## E2 — The Game Studio department Pack (as data)

### Purpose
The Pack itself: run E1's compiler, review the diff, and author the parts that have no CCGS counterpart
(manifest, evals, dashboard, defaults). Nine of the twelve directories are data.

### Scope
In: `departments/game-development/` — roles, playbooks, standards, guards, registries, templates,
stage-model, dashboards, evals, manifest, defaults. Out: publishing (E3), install (E4), attribution gate (E6).

### Dependencies
E1; `/docs-v2/02-game-studio-department.md` (the department spec); M13 (the twelve-directory contract).

### Public APIs
None — this epic produces **data**. The exit is a Pack directory that passes the twelve M13 install checks
locally.

### Acceptance criteria
The compiled Pack passes all twelve M13 install checks; 49 archetypes present with `derived_from`; the manifest
declares the boundary contracts (§4.8); defaults match `/docs-v2/02-game-studio-department.md` §10.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T2.1** | Run E1 → 49 archetypes; review the diff; resolve the judgement calls | L | E1 | `departments/game-development/roles/` | 49 archetypes; each passes the ten-section spec; every `Bash` decision applied; engine set filterable at install (§4.2) |
| **T2.2** | 73 playbooks + the nine `team-*` Workflow DAGs | M | E1 | `.../playbooks/` | 73 playbooks compile as valid DAGs (M13 install check 6) |
| **T2.3** | 11 Standards with paths rewritten to the Artifact tree; inheritance firm>app>dept; `prototype-code` exemption | M | E1 | `.../standards/` | Path globs resolve; a Standard tightens but never relaxes an inherited one (§4.4) |
| **T2.4** | 12 Guards: 7 declarative TOML + 3 Tier-2 Wasm validators (registry-consistency, stage-artifact-check, asset-budget) + the 2 kernel-native deleted | M | E1 | `.../guards/`, `.../tools/` | Each declarative Guard parses and names a known lifecycle point (M13 check 7); Wasm validators declare fuel, request no ambient authority (§4.5) |
| **T2.5** | 2 Registries + 38 templates + `stage-model.yaml` (7 stages, evidence-based artifact checks) | M | E1 | `.../registries/`, `.../templates/`, `.../stage-model.yaml` | Registries declare owner + append-only (check 8); stage artifact checks resolve (§4.7) |
| **T2.6** | The manifest (`department.toml`): identity, capabilities, provides/requires contracts, budget 0.20, review block, fs scope, signature | M | T2.1–T2.5 | `.../department.toml` | `requires.contracts` names no department (check 3); role capabilities ⊆ dept (check 4); boundary contracts per §4.8 |
| **T2.7** | Dashboards (fixed panel set) + evals (original work) + defaults | M | T2.6 | `.../dashboards/`, `.../evals/`, defaults in manifest | Panels reference only known types, tokens only (check 9); `evals/` non-empty (check 10); defaults = `standard`/conservative/engine-unselected/autoscale/0.20 (§10 of the dept spec) |

---

## E3 — The Marketplace: publish / discover / acquire

### Purpose
The working local publisher, the catalogue, and acquire (download + verify). Distribution only — it delivers
an artifact and proves who signed it, and it never confers autonomy (ADR-0045; `/docs-v2/02-layer-model.md`
§8).

### Scope
In: `publish_pack`, `list_listings`/`listing_detail`, `acquire_pack` (download + signature verify, loads
nothing). Out: install (E4 — delegates to M13); attribution check (E6).

### Dependencies
E7 (schema); `sidra-plugins` (signature chain, ADR-0006); E2 (a Pack to publish).

### Public APIs
`publish_pack(pack, signature) -> Listing`; `list_listings()`; `listing_detail(pack)`;
`acquire_pack(listing) -> AcquiredArtifact`.

### Acceptance criteria
Publish runs the twelve checks locally + evals + Security-Office review + signed changelog; acquire verifies
the signature and loads nothing; discovery renders text/static images only; no phone-home.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T3.1** | Publisher: run the twelve checks locally, attach evals (incl. failures), Security-Office capability review, sign with a changelog | M | E2, E7/T7.1, `sidra-plugins` | `marketplace/publish.rs` | A Pack failing any of the four publish steps is not listed; changelog enumerates capability/contract/registry/standard changes (§5.4) |
| **T3.2** | Catalogue + listing: `list_listings`/`listing_detail`; text + static images only; origin line first | M | T3.1, E7/T7.1 | `marketplace/catalogue.rs` | Listing renders no executable content (§5.5, F9); the description's first line is the origin (feeds AC-L1) |
| **T3.3** | Acquire: download + verify signature; **load nothing**; emit `PackAcquired`/`PackSignatureVerified` | M | T3.2, `sidra-plugins`, E7/T7.3 | `marketplace/acquire.rs` | Signature verified before the artifact is retained; nothing is loaded or run; unsigned refused outside dev mode (§5.3 act 1) |
| **T3.4** | No-phone-home + no-promoted-placement guarantees | S | T3.2 | `marketplace/policy.rs` | Installed Packs never contact the Marketplace; browsing uses a named egress host; no ranking-by-payment path exists (§5.5) |

---

## E4 — Install via the M13 machinery

### Purpose
Wire acquire → install (delegating to the M13 Registrar's twelve checks) → grant (a separate Principal
Decision). The three acts, each logged, each independently refusable — and **no Marketplace-private install
path** (ADR-0045).

### Scope
In: `install_pack` (delegates to M13), the capabilities-requested-not-granted state,
`grant_pack_capabilities`, the plain-language capability display, `uninstall_pack` (drives the Retired phase).
Out: the twelve checks themselves (M13, unchanged).

### Dependencies
E3 (an acquired artifact); `sidra-departments` (Registrar, twelve checks, Retired phase); E7 (install records).

### Public APIs
`install_pack(artifact) -> DepartmentId`; `grant_pack_capabilities(department, capabilities)`;
`uninstall_pack(department)`.

### Acceptance criteria
Install delegates to M13 with no bypass; post-install the department holds zero capability; grant is a separate
logged Decision with the plain-language list; uninstall drives Retired and leaves the Firm working.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T4.1** | `install_pack`: delegate to the M13 Registrar's twelve checks; resolve contracts; set status Installed with capabilities **requested, not granted** | M | E3, `sidra-departments`, E7/T7.2 | `marketplace/install.rs` | No code path bypasses the twelve checks (ADR-0045); post-install capability set is empty (§5.3 act 2; AC9) |
| **T4.2** | Plain-language capability display: render each requested capability as its consequence, not its mechanism | S | T4.1 | `marketplace/capability_display.rs` | `integration:cloud:write` shows the consequence sentence (`/docs-v2/05-marketplace-and-packs.md` §2) |
| **T4.3** | `grant_pack_capabilities`: a separate Principal Decision; individual grants; only now can the department act | M | T4.1 | `marketplace/grant.rs` | Grant is a distinct logged event; the department can act only after it (§5.3 act 3; AC9) |
| **T4.4** | `uninstall_pack`: drive the M13 Retired phase — suspend WOs, retire instances, disable Pack, namespace read-only, append `PackUninstalled` | M | T4.1, `sidra-departments`, E7/T7.2 | `marketplace/uninstall.rs` | Retired reached; memory read-only + readable; Artifacts intact; no event rewritten (§8; feeds AC6) |

---

## E5 — Review Intensity setting (ADR-0018)

### Purpose
Ship the Game Studio's Review Intensity default and the override plumbing for this department, preserving
author ≠ reviewer absolutely.

### Scope
In: the Game Studio Pack default (`standard`), `set_review_intensity` at firm/Engagement/department scope, the
Ledger-Line surfacing. Out: the setting primitive itself (a shipped M11 primitive — not re-built here).

### Dependencies
E2 (the manifest carries the default); ADR-0018.

### Public APIs
`set_review_intensity(scope, mode)` where `mode ∈ {full, standard, lean}`; `review_intensity(scope)`.

### Acceptance criteria
The Game Studio ships `standard`; `lean` still guarantees one independent reviewer; no `solo`; class-3/Security
review exempt from the dial; the effective mode is surfaced.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T5.1** | Wire the Pack default (`standard`) and the per-Engagement/per-department override for the Game Studio | S | E2 | `department.toml [review]`, `marketplace/review_intensity.rs` | Default is `standard`; override resolves firm→Engagement→department (§6.1) |
| **T5.2** | Enforce that no mode disables the ADR-0008 reviewer; the mode enum has no `solo`; class-3/Security exempt | S | T5.1 | `.../review_intensity.rs` | `lean` keeps exactly one independent reviewer per Deliverable; enum cannot express `solo` (§6.2; feeds AC-R1) |
| **T5.3** | Surface the effective mode in the Ledger Line and name it in the Brief when a Deliverable shipped with reduced review | S | T5.1 | `.../review_intensity.rs` | Reduced-review Deliverables named in the Brief (ADR-0018 "Accepted: a setting that can be set wrong") |

---

## E6 — Licence / attribution enforcement (CCGS MIT)

### Purpose
Make the CCGS MIT obligations mechanical: a Pack missing provenance does not compile-clean and does not
publish.

### Scope
In: the compiler output check (`PROVENANCE.md`, MIT text, `derived_from` on every artifact) and the publish
gate (origin line first; Legal P0 record). Out: the twelve department install checks (unchanged — attribution
is not a thirteenth check, §7).

### Dependencies
E1 (compiler output); E3 (publish gate); `/docs-v2/03-integration-plan.md` §7.

### Public APIs
`check_provenance(pack) -> Result<(), AttributionError>` (run at compile output and at publish).

### Acceptance criteria
A Pack missing `PROVENANCE.md`, the MIT text, the origin line, or any `derived_from` is refused; the divergence
log is present.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T6.1** | `PROVENANCE.md` generation + check: source repo, author, MIT text verbatim, source commit, import date, divergence log | M | E1 | `ccgs-compile/provenance.rs` | A stripped-provenance Pack fails the check; MIT text present verbatim (§7; App. D) |
| **T6.2** | `derived_from` presence check over every compiled archetype/playbook/standard/guard | S | E1, E2 | `ccgs-compile/provenance.rs` | A compiled artifact missing `derived_from` fails (feeds AC-L1) |
| **T6.3** | Publish gate: the listing's first line is the CCGS/MIT origin; Legal P0 review recorded before compilation | S | E3, T6.1 | `marketplace/publish.rs` | Origin line first (not a footnote); publish refused if absent (§7, §5.4; AC-L1) |

---

## E7 — Migrations 0016–0018 + events

### Purpose
Additive, forward-only schema and the distribution/lifecycle event variants.

### Scope
In: migrations `0016`–`0018`, the `MarketplaceEvent` variants, no business logic. Out: the writers (E3/E4).

### Dependencies
`sidra-store`; the band `0016`–`0018` (after M11–M13, before M15). Confirm the band is free before writing.

### Acceptance criteria
Forward-only, idempotent, independently deployable; empty catalogue + zero installs = pre-M14 behaviour; no
table can hold a secret (distribution carries no authority).

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T7.1** | `0016_marketplace_listings.sql` — catalogue projection | S | — | `services/store/migrations/` | Forward-only; idempotent; rebuildable from events; holds `origin_line` + `requested_capabilities`, no secret |
| **T7.2** | `0017_pack_installs.sql` — install record with the lifecycle status incl. Retired | S | T7.1 | `migrations/` | `status` covers Proposed…Retired; `provenance_ref` present; forward-only |
| **T7.3** | `0018_marketplace_events.sql` — audit projection for the three acts + uninstall | S | T7.1 | `migrations/` | Stores `event_kind`/`actor`/`outcome`; **no column can hold a credential** (distribution ≠ authority) |
| **T7.4** | `MarketplaceEvent` enum — all §10 variants with `actor` + `pack_id` (+ `department_id`) | M | E2 | `domain/events.rs` | Every kind in §10 present; the three acts are three distinct kinds; serde round-trip; schema snapshot committed |

---

## E8 — The nine-item acceptance harness (incl. uninstall)

### Purpose
The exit criterion, made a test suite. **The last thing to go green**, and its final task is the uninstall
proof (AC6).

### Scope
In: the nine-item harness (§13), the invariant checks (AC-K1/AC-R1/AC-L1), and the full-title pipeline fixture.
Out: any new department or Marketplace behaviour — this epic verifies the others.

### Dependencies
All prior epics.

### Acceptance criteria
AC1–AC9 and AC-K1/AC-R1/AC-L1 each covered by a named test; the uninstall proof (AC6) asserts the Firm still
runs, memory is read-only and readable, and Artifacts are intact.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T8.1** | Install-checks test: the Game Studio Pack passes all twelve; broken variants each refuse naming the rule | M | E2, E4 | `infrastructure/testing/game-studio/install.rs` | AC1 — twelve checks pass; each break named, no override |
| **T8.2** | Roster instantiation test: 49 archetypes instantiate, each a valid first Turn | M | E2, E4 | `.../roster.rs` | AC2 — all 49 instantiate |
| **T8.3** | Full-title pipeline: Concept → Pre-Production produces concept doc, 3 GDDs, arch doc + ADRs, seeded entity registry, validated vertical slice | L | E2, E4 | `.../pipeline.rs` | AC3 — each artifact exists and satisfies its stage pattern; no manual intervention beyond Directives/approvals |
| **T8.4** | Guards-fire test: every Guard blocks a deliberately-bad input | M | E2 | `.../guards.rs` | AC4 — all twelve exercised and blocking |
| **T8.5** | Exchange test: `capability.security-review` → Cybersecurity completes, charged to the Game Studio | M | E4, `sidra-departments` | `.../exchange.rs` | AC5 — resolved by contract, completed, cost on the requester |
| **T8.6** | Publish/acquire/three-acts test: publish gate; acquire loads nothing; three separate refusable acts | M | E3, E4 | `.../marketplace.rs` | AC7, AC8 — three distinct events; refusing one leaves the others un-executed |
| **T8.7** | Authority test: post-install capability set empty; grant is a separate Decision; no autonomy on arrival | M | E4 | `.../authority.rs` | AC9 — zero capability until grant (distribution ≠ authority) |
| **T8.8** | Invariant checks: CI grep for department-id/shell in kernel crates (AC-K1); `lean`-keeps-a-reviewer property test (AC-R1); attribution check (AC-L1) | M | E1, E5, E6 | `infrastructure/ci/`, `.../invariants.rs` | AC-K1, AC-R1, AC-L1 — build fails on a hit; `solo` unrepresentable; stripped-provenance refused |
| **T8.9** | **Uninstall proof (the exit criterion, headline):** uninstall the Pack; assert kernel+executive still run, `dept.game-development.*` read-only + readable, Artifacts intact, later `capability.game-design` request fails `contract_unavailable` cleanly | M | E4, T8.1–T8.8 | `.../uninstall.rs` | **AC6 — uninstall leaves the Firm working; the Layer-3 replaceability proof; the LAST thing to go green** |

---

## Deliverables summary

| Epic | Primary deliverable |
|---|---|
| E1 | the maintained CCGS→Pack compiler + judgement register (ADR-0019) |
| E2 | the Game Studio Department Pack (data) — 49/73/11/12/2 + manifest + defaults |
| E3 | the working local publisher + catalogue + acquire (ADR-0045) |
| E4 | install via M13 + the three acts + uninstall (Retired) |
| E5 | Review Intensity default + override, author ≠ reviewer preserved (ADR-0018) |
| E6 | CCGS MIT attribution enforcement (`PROVENANCE.md`, MIT text, origin line, `derived_from`) |
| E7 | migrations 0016–0018 + the distribution/lifecycle events |
| E8 | the nine-item acceptance harness — uninstall-leaves-Firm-working is the exit criterion and the last green |

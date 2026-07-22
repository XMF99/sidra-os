# Firm Templates and Portability — Implementation Plan

**Milestone M25 · crate `sidra-portability` · for AntiGravity**

| | |
|---|---|
| Architecture | `FIRM_TEMPLATES_AND_PORTABILITY_ARCHITECTURE.md` (this package) — decides behaviour |
| ADRs | 0067 (structure-not-data boundary) · 0068 (Marketplace distribution; install grants nothing) |
| Crate | `sidra-portability` at `services/portability/` |
| Depends on | `sidra-marketplace`, `sidra-departments`, `sidra-store`, `sidra-security`, `sidra-domain` |
| Must not depend on | `sidra-orchestrator`, `sidra-mission`, any operational-data / memory-content service (CI-enforced) |

---

## 0. How to use this document

### 0.1 Relationship to the architecture

The architecture decides *what is true*; this plan decides *what to build and in what order*. Where this plan
appears to contradict the architecture, the architecture is right and this plan is a defect to report. No task
here re-opens an ADR.

### 0.2 Task conventions (inherited from the Mission Engine plan §0.4 and the M16 plan, unchanged)

- **One task = one commit = one review.** A task that cannot be reviewed in one sitting is too large; split it
  before starting.
- **Complexity is reviewer load, not calendar time.** **S** ≈ under 200 lines, one concept · **M** ≈ 200–600
  lines or one concept with real edge cases · **L** ≈ 600+ lines or cross-module. **There are no XL tasks.**
- **Every task ships its own tests.** No "tests follow later." A task without tests is not done.
- **Every task leaves `main` green.** Feature-flag if incomplete; never break the build.
- **No production code in this package.** This plan is the specification AntiGravity implements.

### 0.3 Epic map

| Epic | Name | Delivers |
|---|---|---|
| E1 | Structure/data partition & Template domain model | ADR-0067's partition as data; the manifest, org chart, PackRef, structural-Canon, attestation types |
| E2 | Export: select structure, boundary-check, package, sign | the export path and its hard-refusal boundary check |
| E3 | Install into an empty Vault: reproduce structure | the importer, empty-Vault guard, Pack resolution, the transactional reproducer |
| E4 | Structural-vs-data Canon handling | the row-level Canon eligibility + opt-in inclusion (§5.3) |
| E5 | Marketplace distribution reuse | acquire/verify/tier + PackRef resolution through M14; no new trust mechanism |
| E6 | Persistence 0054–0056, events & Vault mirror | the three additive tables, the event variants, the Markdown mirror |
| E7 | Reproducibility acceptance (the exit criterion) | the export→install→structure-without-data proof; the CI boundary test |

### 0.4 Recommended implementation order

```
E1 ──► E2 ──┐
   │        ├──► E3 ──► E7
   ├──► E4 ──┘         ▲
   └──► E5 ────────────┘
        E6 runs alongside E3 (schema before the reproducer writes to it)
```

E1 first (the partition and types everything else references). E2 next (export cannot exist without the
boundary check). E4 (Canon) can proceed in parallel with E2 once E1 lands, since it is a row-level refinement
of the same boundary. E5 (Marketplace reuse) can proceed in parallel — it wires existing M14 machinery. E3
assembles E2's output into an install and needs E5's Pack resolution. E6 lands the schema just ahead of E3's
writes. **E7 is the exit criterion and must be the last thing green — specifically its final task, the
zero-source-data proof.**

---

## E1 — Structure/data partition & Template domain model

### Purpose
ADR-0067's partition, as data, plus the vocabulary every other epic types against: the manifest, the org
chart, PackRef, structural-Canon entry, the boundary attestation, import provenance.

### Scope
In: the `partition` module (the §5 table→{structure,data} map, versioned) and the value objects / aggregates
in `packages/domain` (or `services/portability/domain` per the crate's dependency rules). Out: the boundary
*check* logic (E2), persistence (E6).

### Dependencies
`sidra-domain` (`Sha256`, `Timestamp`, `Seat` if present from M21; `SemVer`); `sidra-departments` (org-graph
vocabulary — `DeptNode`, `Division`, `Office`); confirm before duplicating.

### Public APIs
Constructors that reject invalid construction; `boundary_partition() -> Partition`; no field on the manifest
can carry a data-side item (type-enforced).

### Acceptance criteria
The partition classifies every table through M24; a `StructuralCanonEntry` cannot construct from a
non-principal / non-firm / referenced row; the manifest has no field for events/engagements/memory/budgets/
Seats/grants; property tests over each.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T1.1** | Scaffold `sidra-portability` crate: manifest, module skeleton, CI wiring, dependency-direction check | S | — | `services/portability/Cargo.toml`, `src/lib.rs`, `infrastructure/ci/` | Crate builds; CI fails on any edge `sidra-portability → sidra-orchestrator`, `→ sidra-mission`, or `→` any operational-data/memory-content service (AC3, G8) |
| **T1.2** | The §5 partition as data: every table + Vault path → `{structure, data}`, versioned; `boundary_partition()` | M | T1.1, `sidra-store` (schema list) | `partition/mod.rs` | Every table through M24 classified; a table absent from the partition is treated as `data` (§5.2); `partition_version` set |
| **T1.3** | Value objects: `TemplateId`, `TemplateVersion`, `PackRef{id,version,tier,hash}`, `ArchetypeRef`, `OrgNodeId`, `CanonId` | S | T1.1 | `domain/values.rs` | `PackRef` requires a pinned `manifest_hash`; property tests; opaque ids |
| **T1.4** | `OrgChart`: divisions, offices, departments, reporting edges, veto scopes, head assignments | M | T1.3, `sidra-departments` | `domain/org_chart.rs` | Carries no `agent_versions`, no instance, no `agent_kpi_samples` — the type has no field for them (§4.4) |
| **T1.5** | `StructuralCanonEntry`: `source_type='principal'`, `scope='firm'`, active, unreferenced | S | T1.3 | `domain/canon_entry.rs` | Cannot construct from `source_type ∈ {document,decision,inference}` or an engagement-scoped/referenced row (§4.7) |
| **T1.6** | `BoundaryAttestation`: partition version, excluded tables, digest over packaged bytes | S | T1.2 | `domain/attestation.rs` | Digest computed over actual bytes, not intended selection (§7.2 rule 7) |
| **T1.7** | `TemplateManifest` + `FirmTemplate` aggregate: identity, org chart, charter set, pack selection, structural Canon, attestation, signature | M | T1.4, T1.5, T1.6 | `domain/manifest.rs` | Immutable; **no field for** events/engagements/memory/budgets/Seats/capability-grants/data-Canon (§4.2, ADR-0067) |
| **T1.8** | `ImportProvenance`: template id/version/hash, installed_at, installing Seat, genesis event | S | T1.3 | `domain/provenance.rs` | Carries the target's own Seat; no reference into any source-Firm datum (§4.9) |

---

## E2 — Export: select structure, boundary-check, package, sign

### Purpose
Turn a structure selection into a signed Firm Template — or a named refusal. The boundary check is the load-
bearing guard.

### Scope
In: the selection surface (structure only), the export boundary check (§7.2, the seven rules), the packager,
and signing via the Marketplace chain. Out: Canon eligibility internals (E4), Pack resolution (E5), install
(E3).

### Dependencies
E1; E4/T4.1 (Canon eligibility, for the structural-Canon rule); `sidra-security` (the redaction/secret scan
reused in check rule 6); `sidra-marketplace` (signing, ADR-0006 chain).

### Public APIs
`select_template_structure(org_chart_scope, pack_scope) -> Selection`;
`export_firm_template(selection, chosen_canon) -> Result<SignedTemplate, ExportError>`.

### Acceptance criteria
Every §7.2 rule enforced; each failure names its rule; no override path; the boundary check runs on the
assembled bytes before packaging; export is a logged Decision.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T2.1** | Selection surface: name structure only; a data-side table cannot be named (type + partition enforced) | M | E1 | `exporter/select.rs` | A selection referencing a data-side table is rejected at construction (§5.2); structure-only round-trips |
| **T2.2** | Boundary check rules 1–5 (structure-only mapping; no data-side table/path; Canon eligibility; PackRef-only; no agent history) | M | T2.1, E4/T4.1 | `boundary/check.rs` | Each rule has a failing fixture asserting the named rule; rule 3 names the offending `source_type` |
| **T2.3** | Boundary check rules 6–7 (full-text scan for operational ids / secrets; attestation over actual bytes) | M | T2.2, `sidra-security` | `boundary/scan.rs` | Rule 6 rejects an artifact containing an engagement id, event hash, budget figure, Seat id, or `KeychainRef`; rule 7 digests packaged bytes |
| **T2.4** | Packager: assemble `template.toml` + org chart + PackRef list + structural Canon + attestation | M | T2.2, E1 | `packager/assemble.rs` | Produces a manifest with no data-side field; attestation matches packaged bytes |
| **T2.5** | Signing via the Marketplace chain; export as a logged Principal Decision | S | T2.4, `sidra-marketplace`, E6/T6.4 | `exporter/sign.rs` | Signed under the publisher key (ADR-0006); `TemplateExported` emitted; developer mode relaxes signing but **never** the boundary check (§7.2) |

---

## E3 — Install into an empty Vault: reproduce structure

### Purpose
The importer and the transactional reproducer — the heart of the exit criterion. Reproduce structure into an
empty Vault; grant nothing; write no data.

### Scope
In: signature verify + import-side boundary re-check, the empty-Vault guard, PackRef resolution wiring (calls
E5), the transactional reproducer (org chart via the Registrar, Pack installs, structural Canon), provenance.
Out: the Marketplace resolution mechanism itself (E5), the acceptance proof (E7).

### Dependencies
E1, E2 (the check is shared), E5 (Pack resolution), E6 (schema); `sidra-departments` (Registrar writes org
chart); `sidra-store` (transaction).

### Public APIs
`acquire_firm_template(source) -> AcquiredTemplate`;
`install_firm_template(template) -> Result<Reproduced, InstallError>`.

### Acceptance criteria
Install into an empty Vault reproduces the org chart / Packs / structural Canon; install into a non-empty Vault
is refused `vault_not_empty` untouched; a missing Pack is refused `pack_unavailable`; install is atomic and
grants nothing.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T3.1** | Importer front: verify signature + trust tier; re-run the boundary check on received bytes (§7.6) | M | E2, E5/T5.1 | `importer/verify.rs` | A Template failing the boundary check at the importer is refused even with a clean attestation (AC10) |
| **T3.2** | `EmptyVaultGuard`: define + check the empty-Vault precondition (schema migrated, chain at genesis, one Seat, data side empty) | M | E1, `sidra-store` | `importer/empty_guard.rs` | A non-empty Vault is refused `vault_not_empty`; the existing Firm is untouched (§7.5, F2, AC4) |
| **T3.3** | The transactional reproducer: BEGIN → install Packs → write org chart → instantiate eager heads → write structural Canon → COMMIT; rollback on any failure | L | T3.1, T3.2, E5, E6 | `reproducer/apply.rs` | Atomic (invariant §3.3.3); a mid-install failure rolls the Vault back to empty (AC11); heads instantiate per ADR-0014 |
| **T3.4** | Grant-nothing: the reproducer calls no grant API; reproduced departments are capability-idle | S | T3.3 | `reproducer/apply.rs` | Post-install: every grant table empty; a department invoking an effect is Broker-denied (F8, AC9, §7.3) |
| **T3.5** | Provenance: append `TemplateInstalled` (the birth event) and write the provenance row with the target's own Seat | S | T3.3, E6/T6.3 | `provenance/record.rs` | Reproduced chain begins at its own genesis; provenance carries no source-Firm reference (§4.9, AC12) |

---

## E4 — Structural-vs-data Canon handling

### Purpose
The one place structure and data share a table. Row-level eligibility and opt-in, per-statement inclusion.

### Scope
In: `canon` row eligibility (§5.3), the plain-language preview surface, the opt-in selection that feeds the
exporter. Out: the generic boundary check (E2), which *calls* this for the Canon rule.

### Dependencies
E1; `sidra-store` (read `canon`, structure-side only).

### Public APIs
`canon_eligibility(row) -> Eligible | Ineligible{reason}`;
`preview_structural_canon() -> [EligibleCanonEntry]`.

### Acceptance criteria
Only principal-sourced, firm-scoped, active, unreferenced rows are eligible; inclusion is opt-in per statement;
no "include all Canon" path.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T4.1** | `canon_eligibility`: `source_type='principal'` ∧ `scope='firm'` ∧ `status='active'` ∧ no engagement/document/decision reference | M | E1 | `canon/eligibility.rs` | `source_type ∈ {document,decision,inference}` → Ineligible naming the type; engagement-scoped → Ineligible (§4.7, §5.3) |
| **T4.2** | `preview_structural_canon`: the plain-language list of eligible statements for opt-in | S | T4.1, `sidra-store` | `canon/preview.rs` | Returns only eligible rows, as statements a Principal reads; no bulk-include affordance (G7) |
| **T4.3** | Opt-in selection: `chosen_canon` carries only previewed, explicitly-selected ids into the exporter | S | T4.2, E2/T2.4 | `canon/select.rs` | An unchosen eligible row does not appear in the Template (F7); a chosen ineligible row is impossible (T4.1) |

---

## E5 — Marketplace distribution reuse (ADR-0068)

### Purpose
Distribute and install a Template through the existing Marketplace/Pack machinery — no new trust mechanism.

### Scope
In: acquire + signature/trust-tier verification via M14; PackRef resolution (resolve each `(pack_id, version)`
from the Marketplace, verify the pinned `manifest_hash`, install under the twelve checks). Out: the reproducer
that consumes resolved Packs (E3).

### Dependencies
E1; `sidra-marketplace` (M14 — acquire, tiers, signing, the twelve checks, ADR-0013).

### Public APIs
`resolve_pack_refs(selection) -> Result<[ResolvedPack], ResolveError>`;
`verify_and_tier(artifact) -> Result<TrustTier, AcquireError>`.

### Acceptance criteria
A Template is acquired/verified exactly as any Marketplace artifact; a PackRef whose Pack is unavailable or
whose hash mismatches is a named refusal; no Pack body is ever embedded in a Template.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T5.1** | Acquire + verify: signature + trust tier via M14; Templates as the top-row artifact (`05-marketplace-and-packs.md` §1) | M | E1, `sidra-marketplace` | `marketplace/acquire.rs` | Unsigned blocked outside developer mode; community-tier requires the full scroll-to-end review; review depth ≥ Pack (G2) |
| **T5.2** | `resolve_pack_refs`: resolve each PackRef from the Marketplace; verify pinned `manifest_hash`; install under the twelve checks | M | T5.1 | `marketplace/resolve.rs` | Unavailable Pack → `pack_unavailable{id,version}` (F3, AC11); hash mismatch → refused (T-pack-substitution) |
| **T5.3** | No-embed assertion: a Template artifact carries PackRefs only, never a Pack body or registry payload | S | E1, T5.2 | `marketplace/tests/no_embed.rs` | A Template containing a Pack body is rejected at packaging and at import (§4.6) |

---

## E6 — Persistence 0054–0056, events & Vault mirror

### Purpose
Additive, forward-only schema; event variants; the human-readable Markdown mirror.

### Scope
In: migrations `0054`–`0056`, the `TemplateEvent` variants, the Vault mirror writer. Out: business logic.

### Dependencies
`sidra-store`; the M17–M24 migrations consume up to `0053`, so Template migrations start at `0054`.

### Acceptance criteria
Forward-only, idempotent, independently deployable; null template = pre-M25 behaviour; **no table holds
operational data**; mirror holds no source datum.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T6.1** | `0054_firm_templates.sql` — installed/exported template records | S | — | `services/store/migrations/` | Forward-only; idempotent; independently deployable; `kind ∈ {exported,installed}` |
| **T6.2** | `0055_template_manifest.sql` — export manifest projection (org chart, PackRef list, structural-Canon ids, attestation) | S | T6.1 | `migrations/` | Holds structure + Canon ids only; no engagement/memory/budget content; rebuildable from a stored artifact |
| **T6.3** | `0056_template_provenance.sql` — import birth record | S | T6.1 | `migrations/` | At most one row per Vault; carries a hash + the target's own Seat; no source-data link |
| **T6.4** | `TemplateEvent` enum — all variants with actor(Seat) + template_id + manifest_hash | M | E1 | `domain/events.rs` | Every kind in §11.2 present incl. `TemplateInstallRefused{reason}`; serde round-trip; schema snapshot committed |
| **T6.5** | Vault Markdown mirror writer (on state transitions, not continuously) | M | T6.4 | `mirror/write.rs` | `templates/exported/*/template.md`, `attestation.md`, `provenance.md` written; no source datum appears |

---

## E7 — Reproducibility acceptance (the exit criterion)

### Purpose
The exit criterion, made a test. **The last thing to go green.**

### Scope
In: the reproducibility harness (export → install into empty Vault → assert same structure, zero source data),
the boundary corpus, the importer re-verify test, atomicity, grant-nothing, and the CI boundary + partition
checks. Out: any Template content itself.

### Dependencies
All prior epics.

### Acceptance criteria
AC1–AC12 each covered by a named test; the reproducibility proof (AC5–AC9) asserts both the org-chart
isomorphism and COUNT = 0 on every data-side table; **AC7–AC9 (the zero-source-data proof) is the final task
and the last thing green.**

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T7.1** | Export-check corpus: selections each tainted with one data-side item, each refused naming its rule | M | E2, E4 | `infrastructure/testing/portability/boundary_corpus.rs` | AC1 — engagement id / memory chunk / budget / derived Canon / Seat / grant each refused at export |
| **T7.2** | Manifest-schema test: no field for events/engagements/memory/budgets/Seats/grants/data-Canon | S | E1 | `.../manifest_schema.rs` | AC2 — the absent fields are unrepresentable |
| **T7.3** | Empty-Vault + non-empty refusal test | S | E3 | `.../empty_vault.rs` | AC4 — install into empty Vault completes; non-empty refused untouched |
| **T7.4** | Org-chart isomorphism + Pack/charter/Canon parity test over a source→export→install fixture | M | E3, E5 | `.../parity.rs` | AC5, AC6 — same graph, same Packs (ids/versions/tiers, twelve-check pass), same charter set, same chosen Canon |
| **T7.5** | Importer re-verify tamper test (smuggled datum + forged attestation → refused at install) | M | E3 | `.../reverify.rs` | AC10 — importer's boundary re-check is authoritative |
| **T7.6** | Atomicity: Pack-unavailable and mid-install-failure both leave the Vault empty | M | E3, E5 | `.../atomicity.rs` | AC11 — `pack_unavailable`; rollback to empty; no partial Firm |
| **T7.7** | Audit + chain-ancestry test: every export/install/refusal is on the chain; reproduced chain has no source ancestor | S | E3, E6 | `.../audit.rs` | AC12 — `audit.verify` passes; genesis is the target's own |
| **T7.8** | CI checks: structure/data-boundary test, grant-nothing test, dependency-direction check, partition-completeness check | S | E1, E2 | `infrastructure/ci/` | AC3 — build red if any data-side item reaches the export path, any grant exists post-install, an edge to orchestrator/mission exists, or a table is unclassified |
| **T7.9** | **The reproducibility proof (the exit criterion):** stand up a source Firm with a populated data side; export; install into an empty Vault; assert same structure and COUNT = 0 on every data-side table | M | T7.1–T7.8 | `.../reproducibility.rs` | **AC7, AC8, AC9 — zero source events/engagements/memory/budgets/Seats/data-Canon/grants in the installed Vault. The last thing to go green.** |

---

## Deliverables summary

| Epic | Primary deliverable |
|---|---|
| E1 | the structure/data partition + Template domain types |
| E2 | export + the boundary check (ADR-0067) |
| E3 | install into an empty Vault + the transactional reproducer |
| E4 | structural-vs-data Canon handling |
| E5 | Marketplace distribution reuse (ADR-0068) |
| E6 | migrations 0054–0056, events, Vault mirror |
| E7 | reproducibility proof — structure without data (exit criterion) |

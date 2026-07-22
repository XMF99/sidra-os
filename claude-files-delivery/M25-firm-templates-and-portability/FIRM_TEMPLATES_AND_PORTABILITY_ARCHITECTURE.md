# Firm Templates and Portability — Architecture

**Milestone M25 · Release 3.0 "Chambers" · Layer 8 (Marketplace)**

| | |
|---|---|
| Milestone | M25 — Firm Templates and Portability (`/MILESTONE_REGISTRY.md` §4, 3.0 "Chambers") |
| Release | 3.0 "Chambers" — the Firm admits colleagues; **M25 closes the release** |
| Layer | 8 — Marketplace (`/docs-v2/02-layer-model.md` §8; distribution, `/docs-v2/05-marketplace-and-packs.md`) |
| New crate | `sidra-portability` at `services/portability/` |
| Depends on | M14 (Marketplace / Pack machinery, ADR-0013), M21 (Seats, ADR-0021); reuses M13 (departments / Registrar) and M2 (event log) |
| Status | Documented (this package) · implementation Open |
| Exit criterion | A Firm Template installs into an **empty Vault** and reproduces the source Firm's structure **without its data** — proven by test, not by inspection |

> **Authoritative precedence.** Where this document disagrees with `/docs-v2/05-marketplace-and-packs.md`
> about how an artifact is acquired, installed, signed, or trusted, that document governs — a Firm Template
> is one more artifact under the rules already written there, not a new distribution mechanism. Where it
> disagrees with `/MASTER_IMPLEMENTATION_GUIDE.md` §3 item 8 / §12 ("installation grants nothing"), the guide
> governs. Where it disagrees with ADR-0021 about the Seat model, ADR-0021 governs — a Template is
> seat-agnostic and never carries a source Seat. This architecture *extends* those boundaries; it never
> re-decides them.

---

## 1. Why this subsystem exists

### 1.1 The problem

Through M24 a Firm is a single, dense, private object. Its org chart, its charters, its installed Department
Packs, and its Canon describe *what kind of company it is*; its events, engagements, work orders, memory, and
budgets describe *everything it has ever done*. Those two things live in one `sidra.db` and one Vault, and
there is no way to hand someone the first without handing them the second.

That is a real gap for the release that admits colleagues (`/MILESTONE_REGISTRY.md` §4, 3.0). Sidra Systems
will stand up more than one Firm — a client engagement, a subsidiary, a fresh product line, a clean-room
regulated instance — and each should start from a *known-good shape* rather than from the twenty-one-department
default (`/docs-v2/04-department-catalog.md` warns against exactly the arrive-fully-populated failure). The
mechanism to "start a new Firm shaped like this one" must exist. It must also be the single most careful piece
of export machinery in the system, because the obvious naive implementation — dump the database, ship it —
is a catastrophic data leak wearing the word "template".

The requirement is not "export the Firm." An export of the Firm is an exfiltration primitive with a friendly
name. The requirement is: **let a Principal package the *structure* of a Firm — its org chart, its charter
set, its Pack selection, and the durable identity portion of its Canon — into a signed, distributable
artifact that carries none of the Firm's operational data, and that, installed into an empty Vault, produces
a new Firm of the same shape holding zero of the source's events, engagements, memory, budgets, Seats, or
derived knowledge.**

### 1.2 The stance

Two commitments define portability, and each has an ADR:

1. **A Firm Template carries structure, never data — and the boundary between the two is defined, mechanical,
   and enforced.** (ADR-0067) There is an explicit partition of every table and every Vault path into
   *structure* (exported) and *data* (excluded). Export cannot reach the data side, and a Template that
   nonetheless contains an operational datum is refused before it can be signed. "Structure not data" is a
   compile-and-test property, not a promise in prose (§3, §7, §17).
2. **A Firm Template distributes through the existing Marketplace/Pack trust chain, and its installation
   grants nothing.** (ADR-0068) A Template is a larger sibling of a Department Pack (`05-marketplace-and-packs.md`
   §1): acquired, signature-verified, and installed under the same three-act model, where *install* and
   *grant* are separate and only the Principal grants. Reproducing a Firm's structure reproduces *which*
   Packs are installed — never *which capabilities were granted* (`/MASTER_IMPLEMENTATION_GUIDE.md` §3 item 8).

### 1.3 What a Firm Template is, mechanically

A **Firm Template** is a Layer-8 Marketplace artifact (`02-layer-model.md` §8) — the largest one, above the
Department Pack in trust weight (`05-marketplace-and-packs.md` §1) because it describes a whole organisation's
shape rather than one department's. The **portability engine** (`sidra-portability`) is the machinery that
*produces* a Template from a running Firm and *installs* one into an empty Vault. This parallel is deliberate
and load-bearing: it means M25 introduces no new trust mechanism. It reuses the Pack signing chain (ADR-0006
via M14), the twelve-check install discipline (ADR-0013, `03-department-architecture.md` §8), the acquire →
install → grant separation (`05-marketplace-and-packs.md` §2), and the event log (ADR-0002).

```
Layer 8  a Firm Template     ← template.toml + org-chart, charter-set, pack-selection, structural-Canon    (M25, THIS DOC)
Layer 8  sidra-portability   ← the engine: export selection, boundary check, package, sign / install       (M25, THIS DOC)
Layer 3  Department Packs     ← the smaller sibling a Template *references*, installed by the same machinery  (M13/M14)
```

A Template does **not** embed the Pack bodies. It *references* the Packs it selects by id, version, and trust
tier (§4.6), exactly as a lockfile references dependencies. The Packs themselves are resolved and installed
through the Marketplace at install time under their own signatures and their own twelve checks. This keeps a
Template small, keeps every Pack's trust boundary intact, and means a Template can never smuggle a modified
Pack — the Pack that installs is the signed Pack from the catalogue, not a copy inside the Template.

### 1.4 What a Firm Template must never become

- **A data leak disguised as a template.** The single failure that would discredit the whole feature is a
  Template that, examined, contains one engagement summary, one memory chunk, one budget figure, or one
  derived Canon fact. The boundary check (§7.2) refuses to package such a Template, and the CI boundary test
  (§18) fails the build if any operational datum can reach the export path at all.
- **An install that grants authority.** A Template reproduces *structure*. It installs Packs; it does not
  grant capabilities. The installed Firm's departments exist and cannot act until the Principal grants, exactly
  as after any Pack install (`05-marketplace-and-packs.md` §2; guide §12 permanent-no). There is no field in
  a Template that can carry a capability grant, structurally (§7).
- **A carrier of the source Firm's Seats or their identities.** A Template is Firm-level and seat-agnostic
  (ADR-0021, ADR-0068). It never contains a Seat, a Seat's Fences, a Seat's budget, or a Seat's working
  memory. Installed into an empty Vault, the Template produces structure owned by *that* Vault's single Seat —
  never the source's.
- **A carrier of history.** No event, no engagement, no work order, no deliverable, no meeting, no decision,
  no KPI sample, no agent instance. The installed Firm's event chain begins at its own genesis with a single
  `TemplateInstalled` event; it inherits none of the source's chain (ADR-0002 forbids splicing a foreign chain
  in, and there would be nothing to gain — the source's history is the source's).

### 1.5 Relationship to existing concepts

| Existing concept | How M25 relates |
|---|---|
| Marketplace / Pack machinery (M14, `05-marketplace-and-packs.md`) | A Template is one more distributable artifact (§1 of that doc, added as the top row). Acquire / install / grant, trust tiers, signing, no-auto-update, no-phone-home all apply unchanged. M25 adds the Template artifact and its boundary check; it adds no new distribution path. |
| Department Pack (M13, ADR-0013) | A Template *references* Packs by id+version and installs them through the same twelve checks. It does not embed or modify them. The Packs' own isolation contracts are untouched. |
| Role Archetypes (ADR-0014) | The charter set a Template carries is the *archetype declarations* (templates, data) and the org graph's head assignments — never live Agent Instances, their frozen version history, memory, or KPI samples. On install the Registrar instantiates from archetypes exactly as a first-run Firm does. |
| Org chart (M12, `01-org-chart-v2.md`) | The Divisions, Offices, departments, reporting edges, and veto scopes are *the* structure to reproduce. A Template captures this graph and no more. |
| Canon (M5/M13, `04-database-design.md` §6) | The `canon` table holds both durable firm-identity statements and facts derived from operations. M25 splits it: *structural* Canon may be an opt-in Template choice; *data* Canon is excluded, always (§5, ADR-0067). |
| Seats (M21, ADR-0021) | A Template is seat-agnostic. It carries no source Seat and installs into a Vault whose single Seat already exists. The actor field the chain carries since 2.0 is never populated with a foreign Seat by an install. |
| Event log (M2, ADR-0002) | `TemplateExported` and `TemplateInstalled` land on the hash chain like any other Principal Decision. An install never rewrites or imports a chain; it appends to the empty Vault's own chain. |

---

## 2. Design goals

| # | Goal | Met by |
|---|---|---|
| G1 | A Template contains structure and no operational data — provably | ADR-0067; the boundary partition (§5); the export boundary check (§7.2); the CI boundary test (§18) |
| G2 | A Template distributes through the existing Marketplace with no new trust mechanism | ADR-0068; reuse of §1–§6 of `05-marketplace-and-packs.md`; the same signing chain (ADR-0006) |
| G3 | Installing a Template grants no authority | §7.3; a Template has no capability-grant field; install ends at *install*, never *grant* (guide §3 item 8) |
| G4 | Installed into an empty Vault, a Template reproduces the source's org chart, charters, Pack selection, and structural Canon | §11 (persistence), §13 (sequences), §17 (AC1–AC6) |
| G5 | The installed Firm holds zero source events, engagements, memory, budgets, Seats, or data Canon | §17 AC7–AC9; the reproducibility test asserts zero on every excluded table |
| G6 | A Template carries no Seat and is seat-agnostic | ADR-0021; §5 exclusion of Seats; §7.4 threat table |
| G7 | Structural Canon is included only by explicit, per-statement, plain-language Principal choice | §5.3; §12 API rule 4; the export is a Decision (§11.2) |
| G8 | The export engine *cannot* read operational data — structure-not-data is enforced by the dependency graph, not only by a filter | §6 dependency direction; CI edge check (§18); the crate has no edge to orchestrator/mission/memory-content services |
| G9 | Everything is additive; a Firm that never exports or installs a Template behaves exactly as pre-M25 | §11.1 forward-only migrations `0054`–`0056`; null template = no template, exactly pre-M25 behaviour |
| G10 | Install is atomic: an install into a non-empty Vault, or one whose referenced Pack is unavailable, is a clean named refusal that changes nothing | §14 F2/F3; §7.5; install is transactional |

---

## 3. Export / import lifecycle

### 3.1 States

```
  EXPORT SIDE                                          IMPORT SIDE

  (running Firm)                                       (acquired artifact)
       │  select(structure, structural_canon)               │  acquire (signature verified)
       ▼                                                     ▼
   SELECTED                                              ACQUIRED
       │  validate — boundary check (§7.2)                   │  validate — manifest + twelve-check parity (§7.6)
       ▼         │ any operational datum present             ▼         │ malformed / untrusted
   VALIDATED     └──► REFUSED{data_present}              VALIDATED     └──► REFUSED{invalid|untrusted}
       │  package (org-chart + charters + pack-refs +         │  precondition — target Vault empty (§7.5)
       │           structural-canon into template.toml)       ▼         │ vault not empty
       ▼                                                  READY         └──► REFUSED{vault_not_empty}
   PACKAGED                                                   │  resolve referenced Packs (Marketplace)
       │  sign (ADR-0006 chain, via M14)                      ▼         │ a Pack unavailable
       ▼                                                  RESOLVING     └──► REFUSED{pack_unavailable}
   SIGNED ──► distributable artifact ───────────────►        │  install-into-empty-Vault (transactional)
       │                                                      ▼
       │  TemplateExported (hash chain)                   INSTALLING
       ▼                                                      │  structure written; NO grants; NO data
    (done)                                                    ▼
                                                          REPRODUCED ──► TemplateInstalled (hash chain)
                                                              │  provenance recorded (§11.1)
                                                              ▼
                                                           (new Firm, same shape, zero source data)
```

### 3.2 Transition table

| From | Event | To | Guard |
|---|---|---|---|
| (Firm) | `select` | Selected | selection names only structure + opted-in structural Canon (§5.3); no free-form table reference |
| Selected | `validate` | Validated | boundary check passes: no excluded table, path, or `source_type` present (§7.2) |
| Selected | `validate` (fails) | Refused `data_present` | the offending datum's kind is named; nothing is packaged |
| Validated | `package` | Packaged | manifest built; Pack references resolvable at export time (warning-only; hard-checked at install) |
| Packaged | `sign` | Signed | signed under the publisher key via the Pack chain (ADR-0006, M14) |
| Signed | `TemplateExported` | (done) | a Principal **Decision** logged on the hash chain |
| (artifact) | `acquire` | Acquired | signature verified against a trusted publisher / tier (`05-marketplace-and-packs.md` §3) |
| Acquired | `validate` | Validated | manifest schema valid; the Template's own install checks pass (§7.6) |
| Validated | `precondition` | Ready | **target Vault is empty** (§7.5); else Refused `vault_not_empty` |
| Ready | `resolve` | Resolving | every referenced Pack resolvable+installable at its declared version+tier |
| Resolving | `resolve` (fails) | Refused `pack_unavailable` | the missing `(pack_id, version)` is named; nothing installed |
| Resolving | `install` | Installing | transactional: Packs installed, org chart written, structural Canon written |
| Installing | `complete` | Reproduced | **no capability granted, no datum written**; a single `TemplateInstalled` event appended |
| Reproduced | `record_provenance` | (new Firm) | import provenance row written (§11.1); the Firm is now an ordinary Firm |

### 3.3 Invariants

1. **Export cannot reach the data side.** Not "does not by policy" — *cannot*, because `sidra-portability`
   has no dependency edge to the services that own operational data (§6, G8, ADR-0067). A filter that could be
   forgotten is not the guarantee; the absent edge is.
2. **A Signed Template that contains an operational datum does not exist.** The boundary check (§7.2) is a
   guard on the Selected → Validated transition, before packaging. There is no path from Selected to Signed
   that skips it.
3. **Install is atomic and all-or-nothing.** Installing → Reproduced commits in one transaction. A failure at
   any point (Pack unavailable, boundary parity failure, write error) rolls the target Vault back to empty.
   There is no half-installed Firm.
4. **Install never grants and never writes data.** The Reproduced state contains org chart + Packs + structural
   Canon and nothing else. A capability grant or an operational datum in a freshly reproduced Firm is an
   invariant violation the reproducibility test (§17 AC7–AC9) asserts against directly.
5. **The target Vault's identity is its own.** The installed Firm's Seat, its event-chain genesis, and its
   provenance are the target's, never the source's (ADR-0021). Reproducing structure never reproduces identity.

---

## 4. Domain model

### 4.1 Core types

```
TemplateId(String)             // stable id from the manifest, e.g. "sidra-systems-core"
TemplateVersion(SemVer)
PackRef { pack_id, version, trust_tier }   // a reference, never a Pack body
ArchetypeRef(String)           // an archetype declared by a referenced Pack (ADR-0014) — a template, not an instance
OrgNodeId(String)              // a Division / Office / department / head position in the org graph
CanonId(String)                // a canon row id (only structural Canon is eligible)
Sha256(String)                 // manifest / component digests
```

### 4.2 `TemplateManifest` — the whole contract in one file

`template.toml`, mirroring the Pack manifest's "everything trusted is here" stance (ADR-0013).

| Field | Type | Meaning |
|---|---|---|
| `id`, `name`, `version` | ids | identity |
| `sidra_api` | range | kernel compatibility (`05-marketplace-and-packs.md` §4) |
| `publisher`, `signature` | signing | the Pack trust chain (ADR-0006, via M14) |
| `org_chart` | `OrgChart` | Divisions, Offices, departments, reporting edges, veto scopes, head assignments (§4.4) |
| `charter_set` | `[ArchetypeRef]` | archetype declarations the org chart draws on — data, from referenced Packs (§4.5) |
| `pack_selection` | `[PackRef]` | the Department Packs to install, by id+version+tier (§4.6) |
| `structural_canon` | `[StructuralCanonEntry]` | opt-in identity Canon (§4.7, §5.3) — may be empty |
| `boundary_attestation` | `BoundaryAttestation` | the machine-verifiable statement that the boundary check passed at export (§4.8) |

There is **no** field for events, engagements, memory, budgets, Seats, capability grants, or data Canon. Their
absence is structural: the manifest schema has nowhere to put them, exactly as a Playbook Pack has no
capabilities field (`05-marketplace-and-packs.md` §5).

### 4.3 `FirmTemplate` (aggregate)

```
FirmTemplate {
    manifest:      TemplateManifest,
    org_chart:     OrgChart,               // the graph (§4.4)
    charter_set:   Set<ArchetypeRef>,      // charters as templates (§4.5)
    pack_selection: [PackRef],             // references, resolved at install (§4.6)
    structural_canon: [StructuralCanonEntry], // opt-in identity statements (§4.7)
    attestation:   BoundaryAttestation,    // "no data crossed" — machine-checkable (§4.8)
    signature:     Signature,              // ADR-0006 chain
}
```

### 4.4 `OrgChart` — the structure to reproduce

The projection of `01-org-chart-v2.md` into distributable form: the graph shape, none of its accumulated state.

| Field | Type | Meaning |
|---|---|---|
| `divisions` | `[Division{id, executive_position, departments}]` | the eight-Division shape (`04-department-catalog.md` §Division map) |
| `offices` | `[Office{id, head_position, veto_scope, must_review}]` | Quality / Cost / Architecture / Security (`01-org-chart-v2.md` §3) |
| `departments` | `[DeptNode{id, head_archetype, provides, requires, effect_ceiling}]` | department nodes — shape, not data |
| `reporting_edges` | `[{from, to}]` | who reports to whom (Principal→Kai→Divisions→departments) |
| `head_positions` | `[{position_id, archetype_ref}]` | which archetype heads each node (ADR-0014: heads are `eager`) |

`OrgChart` carries **no** agent instance, **no** `agent_versions` history, **no** `agent_kpi_samples`, **no**
memory namespace *content*. It carries the *shape* the Registrar rebuilds against on install.

### 4.5 `ArchetypeRef` / the charter set

A charter set is the set of Role Archetypes (charter templates, ADR-0014) the org chart's positions draw on.
Because archetypes are *data in a Department Pack*, the charter set is carried by reference: `charter_set` names
the archetypes, and the archetypes themselves arrive with the referenced Packs (§4.6). A Template never carries
a *live instance's* frozen charter, memory, or KPIs — those are created fresh on install, exactly as ADR-0014
describes first instantiation. This is the precise line between "the charter set" (structure) and "an agent's
accumulated self" (data).

### 4.6 `PackRef` — the Pack selection, by reference

```
PackRef {
    pack_id:    PackId,          // e.g. "dept.backend"
    version:    SemVer,          // exact — a Template pins its Packs
    trust_tier: TrustTier,       // first-party | verified | community (05-marketplace-and-packs.md §3)
    manifest_hash: Sha256,       // the Pack's signed manifest hash — install verifies the resolved Pack matches
}
```

The Pack selection is a lockfile: it names *which* Packs at *which* versions the reproduced Firm installs, and
pins each to its signed manifest hash so the resolved Pack is provably the one the Template author selected —
never a substitute. The Pack bodies are not in the Template; they are resolved from the Marketplace at install
and installed under their own twelve checks (ADR-0013).

### 4.7 `StructuralCanonEntry` — the only data-shaped thing, and it is opt-in

```
StructuralCanonEntry {
    subject:     String,         // e.g. "firm.identity", "product.line", "pricing.model"
    statement:   String,         // the durable identity claim
    source_type: 'principal',    // ONLY principal-sourced Canon is eligible (§5.3)
    scope:       'firm',         // firm-scoped only; never engagement-scoped
    included_by: Decision,       // the per-statement Principal choice that put it here (G7)
}
```

Every field is constrained so that only durable, principal-authored, firm-identity Canon can appear, and only
because a Principal explicitly chose it, per statement, from a plain-language list (§5.3, §12). Data Canon
(`source_type ∈ {document, decision, inference}`, or any engagement-scoped statement) is structurally
ineligible — the type will not construct.

### 4.8 `BoundaryAttestation` — the boundary made machine-checkable

```
BoundaryAttestation {
    partition_version: SemVer,          // the version of the structure/data partition (§5) this was checked against
    excluded_tables:   [TableName],     // the data-side tables asserted absent
    checked_at:        Timestamp,
    check_digest:      Sha256,          // digest over "what was inspected and found clean"
}
```

The attestation lets an *installer* re-run the same boundary check against the received Template (§7.6) and
confirm independently that no data crossed — the importer does not trust the exporter's word, it re-verifies.

### 4.9 `ImportProvenance` — the birth record

```
ImportProvenance {
    template_id:      TemplateId,
    template_version: TemplateVersion,
    template_hash:    Sha256,
    installed_at:     Timestamp,
    installed_by:     Seat,             // the target Vault's own Seat (never the source's)
    genesis_event:    EventId,          // the TemplateInstalled event on this Vault's chain
}
```

One row, written once, at install. It answers "where did this Firm's shape come from" without linking to any
of the source's data — there is no source-data reference to link to.

### 4.10 Relationships

```
TemplateManifest 1 ──── 1 OrgChart
TemplateManifest 1 ──── * ArchetypeRef        (the charter set)
TemplateManifest 1 ──── * PackRef             (the Pack selection, by reference)
TemplateManifest 1 ──── * StructuralCanonEntry (opt-in; may be zero)
TemplateManifest 1 ──── 1 BoundaryAttestation (machine-checkable "no data crossed")
FirmTemplate     1 ──── 1 Signature           (ADR-0006 chain)
ImportProvenance 1 ──── 1 TemplateId          (a Firm has at most one birth Template)
PackRef          * ──── 1 (resolved) Pack     (from the Marketplace, under its own checks — NOT embedded)
```

---

## 5. The structure / data boundary

This is the heart of the milestone. Everything the Firm knows is partitioned into exactly two sets. The
partition is versioned (`BoundaryAttestation.partition_version`) and is the single source of truth the export
check, the import re-check, and the CI boundary test all consult.

### 5.1 The partition (explicit, exhaustive)

| Category | STRUCTURE — exported (identity/shape) | DATA — excluded (operations/history) |
|---|---|---|
| **Org chart** | Divisions, Offices, departments, reporting edges, veto scopes, head assignments (`01-org-chart-v2.md`) | — |
| **Agents** | org *positions* & head archetype refs; stable agent ids (`agent.exec`, …) as graph nodes | `agent_versions` accumulated history beyond archetype baseline; live Agent Instances; `agent_kpi_samples` |
| **Charters** | Role Archetype declarations / charter set, via referenced Packs (ADR-0014) | any *instance's* frozen charter, private memory lane, KPI history |
| **Packs** | Pack *selection* — id + version + tier + manifest hash (references) | Pack-owned *registry data* written during operation (endpoints, findings, campaigns, …) |
| **Canon** | *structural* Canon: principal-sourced, firm-scoped, identity (opt-in, §5.3) | *data* Canon: `source_type ∈ {document, decision, inference}`; engagement-scoped Canon; `reconciliations` |
| **Standards / Guards** | Standard IDs and Guard declarations as carried *by the referenced Packs* | Standard *violation history*, Guard *block history* |
| **Work** | — | `directives`, `engagements`, `mandates`, `work_orders`, `work_order_deps`, `deliverables`, `reviews`, `briefs` |
| **Governance** | — | `decisions`, `dissents`, `meetings`, `meeting_turns`, `minutes`, `approval_requests` |
| **Execution / cost** | — | `turns`, `turn_context_items`, `tool_calls`, `events`, `budget_ledger` |
| **Memory** | — | `documents`, `chunks`, `chunks_fts`, `chunk_vectors`, `playbooks` derived-from data |
| **Automation** | — | `triggers`, `trigger_runs`, `notifications` |
| **Connectors (M16)** | — | `connectors`, `connector_grants`, `connector_credentials`, `connector_egress`, `connector_calls` |
| **Seats (M21)** | — | every Seat, its Fences, budget, and working memory (ADR-0021) |
| **Capability grants** | — | every grant — a Template installs Packs and grants nothing (§7.3, guide §3 item 8) |
| **UI / prefs** | — | `preferences`, `ui_state`, `artifacts` |

Two rows deserve emphasis because they are where a naive implementation leaks:

- **Agents.** The org graph node `agent.backend.head` is structure; everything that node *did* — its versions,
  its KPI samples, its memory — is data. The Template carries the node and the archetype it heads, not the
  history.
- **Packs.** A Pack's *selection* (that Backend is installed) is structure; a Pack's *registry data* (which
  endpoints Backend registered while working) is data. The Template installs the Pack fresh, with empty
  registries — append-only registries (`05-marketplace-and-packs.md` §4) start empty on install.

### 5.2 The rule for anything not yet in the table

**Default excluded.** Any table, column, or Vault path introduced by a future milestone is on the *data* side
until an ADR moves it to *structure*. A new store the partition does not name cannot be exported, because the
export engine cannot reach it (§6) and the boundary check treats "unknown" as "excluded" (§7.2). This is the
safe default: forgetting to classify a new table leaks nothing.

### 5.3 Canon, handled with care

Canon is the only place where structure and data share a table (`canon`, `04-database-design.md` §6), so it is
the only place the boundary is a *row-level* decision rather than a *table-level* one.

- **Eligible (structural):** a `canon` row is *eligible* for a Template only if `source_type = 'principal'`
  **and** `scope = 'firm'` **and** `status = 'active'` **and** it references no engagement/document/decision.
  These are durable identity statements — "the Firm builds developer tools", "the pricing model is
  usage-based" — the kind of thing that is part of *what the Firm is*, not *what the Firm found out*.
- **Ineligible (data):** every other row. `source_type ∈ {document, decision, inference}` is a fact *derived
  from operations* and is excluded unconditionally. So is any engagement-scoped or `contested`/`retired` row.
- **Inclusion is opt-in, per statement, as a Decision.** Even an eligible row is *not* included by default.
  Export presents the eligible rows in plain language and the Principal selects, per statement, which to carry
  (G7, §12 API rule 4). Canon is the closest thing to data a Template may hold, so its inclusion is the most
  deliberate act in the export — never a bulk "include all Canon".

This mirrors the marketplace rule that a capability is shown as a consequence and granted individually
(`05-marketplace-and-packs.md` §2): structural Canon is shown as a claim and included individually.

---

## 6. Component structure

```
                         ┌───────────────────────────────────────────────────────┐
   Principal              │              sidra-portability (Layer 8)              │
  "export firm            │                                                       │
   template"  ───────────►│  Exporter                                             │
                          │    │  1. select structure (org chart, packs, canon)    │
                          │    ▼                                                   │
                          │  BoundaryCheck ──► reads the §5 partition ONLY         │
                          │    │  2. refuse if any data-side item present          │
                          │    ▼                                                   │
                          │  Packager ──► template.toml + org-chart + refs + canon │
                          │    │  3. build manifest + BoundaryAttestation          │
                          │    ▼                                                   │
                          │  Signer (via Marketplace / Pack chain, ADR-0006)       │
                          └────┼──────────────────────────────────────────────────┘
                               ▼
                        signed Firm Template artifact  ───►  distribution (Marketplace)

                         ┌───────────────────────────────────────────────────────┐
   empty Vault           │              sidra-portability (Layer 8)               │
  "install firm          │                                                       │
   template"  ───────────►│  Importer                                             │
                          │    │  1. verify signature + re-run BoundaryCheck (§7.6)│
                          │    ▼                                                   │
                          │  EmptyVaultGuard ──► refuse if Vault not empty (§7.5)  │
                          │    │  2. resolve PackRefs via Marketplace              │
                          │    ▼                                                   │
                          │  Reproducer (transactional)                           │
                          │    ├─ install referenced Packs (twelve checks, M13)   │
                          │    ├─ write org chart (Registrar, M13)                │
                          │    ├─ write structural Canon                          │
                          │    └─ GRANT NOTHING · WRITE NO DATA                   │
                          │    │  3. append TemplateInstalled; record provenance   │
                          └────┼──────────────────────────────────────────────────┘
                               ▼
                        new Firm — same shape, zero source data
```

Internal modules of `sidra-portability`:

| Module | Responsibility |
|---|---|
| `partition` | the §5 structure/data partition as data; the single source the check, re-check, and CI test consult |
| `exporter` | drive selection → boundary check → package → sign; produce the `template.toml` |
| `boundary` | the boundary check (export) and re-check (import); refuse on any data-side presence |
| `packager` | assemble the manifest, org chart, Pack references, structural Canon, and attestation |
| `importer` | verify → empty-vault guard → resolve Packs → reproduce, transactionally |
| `reproducer` | write org chart via the Registrar, install referenced Packs, write structural Canon — grant nothing |
| `provenance` | write and read the import provenance row |
| `conformance` | the reproducibility harness: export → install into empty Vault → assert same structure, zero data |

**Dependency direction (ADR-0011).** `packages/domain ← services/portability ← apps/*`. `services/portability`
depends on `services/marketplace` (M14 — signing, acquire/install, twelve checks), `services/departments`
(M13 — the Registrar writes the org chart), `services/store` (schema + the read side of the *structure*
tables), and `services/security` (the signing chain, redaction). It does **not** depend on
`services/orchestrator`, `services/mission`, or any service that owns operational data or memory *content* —
and the absence of those edges is what makes G8 real: **the export engine literally cannot read an engagement
or a memory chunk, because it has no path to the code that owns them.** This is a compile-time property
enforced in CI (§18), exactly as the Mission Engine and M16 enforce their non-edges.

---

## 7. Security

A Firm Template is, after connectors (M16), the second-largest outbound surface the Firm has: it is a bundle
that *leaves the machine* and describes the Firm. Every mitigation below is either an application of the
Marketplace controls already written (`05-marketplace-and-packs.md`) or the boundary partition (§5) made
mechanical.

### 7.1 Threat table

| Threat | How M25 addresses it |
|---|---|
| **T-data-leak** — a Template smuggles an engagement, a memory chunk, a budget figure, or a derived Canon fact | The export engine has no dependency edge to the services owning that data (§6, G8) — it cannot read it. The boundary check (§7.2) refuses to package any Template whose contents intersect the §5 data side. The importer re-runs the check (§7.6). The CI boundary test (§18) fails the build if any data-side item can reach the export path. Four independent barriers. |
| **T-authority** — an install grants a capability, so the reproduced Firm can act before the Principal decides | A Template has no capability-grant field (§4.2) — structurally impossible, like a Playbook Pack's absent capabilities field (`05-marketplace-and-packs.md` §5). Install ends at *install*; *grant* is a separate Principal act (§7.3, guide §3 item 8). |
| **T-seat-leak** — a Template carries a source Seat, its Fences, budget, or working memory | Seats are on the data side (§5.1) and structurally excluded (ADR-0021, ADR-0068). The importer's re-check asserts zero Seat material. The installed Firm's Seat is the target's own. |
| **T-canon-leak** — data Canon is smuggled in as structural | The `StructuralCanonEntry` type constrains `source_type = 'principal'`, `scope = 'firm'`, active, unreferenced (§4.7, §5.3). A derived-Canon row will not construct into the manifest, and the boundary check rejects any `canon` row that fails eligibility. Inclusion is opt-in and per-statement (§5.3). |
| **T-pack-substitution** — a Template ships a modified or malicious Pack body | A Template embeds no Pack body — only a `PackRef` pinned to the signed `manifest_hash` (§4.6). Install resolves the Pack from the Marketplace and verifies the resolved manifest hash matches; a substitute fails the twelve checks and the hash pin. |
| **T-supply-chain** — a tampered or untrusted-publisher Template | Same signing chain and trust tiers as any Marketplace artifact (`05-marketplace-and-packs.md` §3): unsigned is blocked outside developer mode; community-tier requires the full plain-language review with scroll-to-end. A Template's higher trust weight (§1, top row) means *at least* the Pack-level review depth. |
| **T-partial-install** — an install fails midway leaving a half-Firm that looks structurally sound but is corrupt | Install is transactional and atomic (invariant §3.3.3): any failure rolls the Vault back to empty. There is no observable half-installed state. |
| **T-phone-home** — a Template contacts the source Firm after install | A Template is inert data + Pack references. It runs no code of its own; the only executable it can bring is a referenced Pack's Wasm tool, which runs in the existing sandbox under its own (ungranted) capability request. No install step opens egress (`05-marketplace-and-packs.md` §5, "phone home"). |

### 7.2 The export boundary check (hard refusal, no override)

The guard on Selected → Validated. Mirrors the Pack's twelve mechanical checks; each failure names the rule.

1. Every item in the selection maps to a *structure* entry in the §5 partition; anything mapping to *data*, or
   to *unknown*, is refused (§5.2 default-excluded).
2. No selected table, column, or Vault path is on the data side of the partition (`partition_version` pinned).
3. `structural_canon` contains only rows satisfying §5.3 eligibility; any ineligible row is refused, naming
   the row's `source_type`.
4. `pack_selection` entries are references only — no entry carries a Pack body, a registry payload, or
   capability grant.
5. `org_chart` carries no `agent_versions` history, no Agent Instance, no `agent_kpi_samples`.
6. A full-text scan of the assembled artifact finds no engagement id, work-order id, event hash, budget
   figure, Seat id, credential/`KeychainRef`, or memory chunk (reuses the M3 redaction/secret scan; extended
   with the operational-id patterns).
7. The `BoundaryAttestation` is computed over the *actual* packaged bytes, not over the intended selection —
   the attestation describes what shipped, not what was meant to ship.

A failure is a hard refusal. There is no override, no developer-mode bypass of the boundary check (developer
mode relaxes *signing*, never the data boundary), and no "export anyway" affordance.

### 7.3 Install grants nothing (guide §3 item 8, in mechanism)

The Reproducer writes org chart, installs referenced Packs, and writes structural Canon. It calls **no** grant
API. The reproduced Firm's departments are installed and *capability-idle*: they exist, their archetypes are
declared, and they can do nothing until the Principal grants — exactly the state a Firm is in after installing
a Department Pack but before granting it (`05-marketplace-and-packs.md` §2, the three acts). A Template that
*could* grant is not a stricter Template; it is a different, forbidden artifact, and the manifest schema has no
field to express it.

### 7.4 Seat-agnosticism (ADR-0021, in mechanism)

The Reproducer never reads or writes a Seat from the Template — there is none. It writes structure into the
target Vault, whose single Seat already exists (an empty Vault has exactly one Seat, its Principal's; ADR-0021).
Every `TemplateInstalled` and provenance row carries the *target's* Seat as actor. The source's Seats are not
excluded by a filter that could be forgotten; they are absent from the manifest by type.

### 7.5 The empty-Vault precondition

The exit criterion is defined against an **empty Vault**. An empty Vault is one where: the schema is migrated;
the event chain holds only genesis; exactly one Seat exists; and every *data-side* table (§5.1) is empty. The
`EmptyVaultGuard` (Ready precondition) refuses an install into any Vault that fails this test, with
`vault_not_empty`, changing nothing (§14 F2). Install into a *populated* Firm is out of scope for M25 and would
need its own ADR — merging one Firm's structure into another's live data is a different, harder problem (a
migration and a reconciliation, not a reproduction) and is deliberately not attempted here.

### 7.6 Import-side re-verification

The importer does not trust the exporter. On Acquired → Validated it (a) verifies the signature and trust tier
(`05-marketplace-and-packs.md` §3), (b) re-runs the §7.2 boundary check against the received bytes using the
same `partition` module, and (c) recomputes the `BoundaryAttestation` digest and compares. A Template whose
shipped bytes fail the boundary check *at the importer* is refused even if the exporter attested clean — the
guarantee is symmetric.

---

## 8. What "reproduces the structure" means, precisely

The exit criterion turns on a precise definition of reproduction. After a Template installs into an empty
Vault, the reproduced Firm has:

1. **The same org chart.** The same Divisions, Offices, departments, reporting edges, veto scopes, and head
   assignments (`01-org-chart-v2.md`). A graph isomorphism holds between source-at-export and reproduced org
   charts.
2. **The same Pack selection.** The same Department Packs, at the same versions and trust tiers, installed and
   passing the twelve checks — with empty registries (fresh install; `05-marketplace-and-packs.md` §4).
3. **The same charter set.** The same Role Archetypes available (via those Packs), with the same instantiation
   policy (`eager` heads, `on_demand` specialists; ADR-0014). Heads instantiate on install exactly as a
   first-run Firm's do.
4. **The same structural Canon** the Principal chose to include (§5.3) — and no other Canon.

And it has, provably, **zero** of the source's:

5. events (beyond its own genesis + `TemplateInstalled`), engagements, mandates, work orders, deliverables,
   reviews, briefs (§5.1 Work / Governance / Execution).
6. memory content — documents, chunks, vectors, derived playbooks (§5.1 Memory).
7. budgets spent, budget ledger, cost history (§5.1 Execution/cost).
8. Seats beyond the target's own; no Fences, budgets, or working memory from the source (§5.1 Seats).
9. data Canon, reconciliations, connector grants/credentials, automations, notifications (§5.1).

Reproduction is *structural isomorphism with an empty data side*. The reproducibility test (§17) asserts both
halves: the isomorphism, and the zero.

---

## 9. Distribution through the Marketplace (ADR-0068, in mechanism)

A Firm Template is added as the top row of the distributable-artifacts table (`05-marketplace-and-packs.md`
§1), above the Department Pack in trust weight because it describes an organisation rather than a department.
Everything else in that document applies unchanged:

- **Three acts (§2).** *Acquire* (download + verify signature) → *Install* (validate; write structure; **grant
  nothing**) → *Grant* (a separate Principal act, per capability, after install). A Template collapses none of
  these; it lives entirely in *install*.
- **Trust tiers (§3).** First-party / verified / community / unsigned, with the same install gates and the
  scroll-to-end review for community-tier. A Template's higher trust weight raises the *default review depth*,
  never lowers it.
- **No auto-update (§3).** A Template is a snapshot; there is no "re-sync from source". A new version of a
  Template is a fresh artifact and a fresh Decision.
- **No phone-home, no rank-by-payment, no execute-during-discovery (§5).** A Template listing renders as text;
  nothing runs. An installed Firm never contacts the source or the Template's origin.
- **Publishing (§6).** A Template passes its boundary check locally, is signed with a changelog that names any
  change to org chart, Pack selection, or structural Canon (the three things that affect what a reproduced Firm
  *is*), and is published. The Security Office reviews a Template's boundary attestation the way it reviews a
  Pack's capability list.

The internal case (§7 of that doc) is the immediate one: Sidra Systems forks Firms the way it forks Packs — a
"regulated-client baseline", a "game-studio-only Firm", a "backend-heavy Firm" — and the Template mechanism is
what makes each a versioned, signed, reviewable act instead of a hand-copied database.

---

## 10. Public APIs

### 10.1 Commands

| Command | Effect | Notes |
|---|---|---|
| `select_template_structure(org_chart_scope, pack_scope) -> Selection` | Selected | names structure only; cannot name a data-side table (type-constrained) |
| `preview_structural_canon() -> [EligibleCanonEntry]` | — | the plain-language list of eligible identity Canon for opt-in (§5.3, G7) |
| `export_firm_template(selection, chosen_canon) -> SignedTemplate` | Signed | runs the boundary check (§7.2); a Principal **Decision**; hard refusal names the failing rule |
| `acquire_firm_template(source) -> AcquiredTemplate` | Acquired | signature + trust-tier verified (`05-marketplace-and-packs.md` §3); nothing installed |
| `install_firm_template(template) -> Reproduced` | Reproduced | empty-Vault guard (§7.5); resolves PackRefs; transactional; **grants nothing, writes no data** |

### 10.2 Queries

| Query | Returns |
|---|---|
| `list_firm_templates()` | Templates exported/installed on this machine + status |
| `template_manifest(id)` | the org chart, Pack selection, structural Canon, and attestation of a Template |
| `template_provenance()` | this Firm's birth record, if it was installed from a Template (§4.9) |
| `boundary_partition()` | the current §5 partition and its version — for review and for the CI test |

### 10.3 API rules

1. **No API exports data.** There is no command that reads an engagement, a memory chunk, a budget, a Seat, or
   a derived Canon row into a Template — the export surface has no such parameter, and the export crate has no
   path to that data (§6).
2. **`export_firm_template` and `install_firm_template` are Decisions** — logged on the hash chain, with the
   plain-language contents shown before the act (the org chart summary, the Pack list, each structural-Canon
   statement).
3. **Install ends at install.** No install path calls a grant API. Reproducing structure is complete without
   any capability being granted (§7.3).
4. **Structural Canon is opt-in, per statement.** `export_firm_template` includes only the entries returned by
   an explicit `chosen_canon` selection made from `preview_structural_canon()`; there is no "include all Canon"
   affordance (G7, §5.3).
5. **The importer re-verifies.** `install_firm_template` re-runs the boundary check (§7.6) before writing
   anything; a Template that fails at the importer is refused regardless of its attestation.

---

## 11. Persistence, events, and the Vault mirror

### 11.1 New tables — all additive (forward-only migrations, `0054`–`0056`)

The connector migrations (M16) end at `0029`; subsequent milestones (M17–M24) consume the band up to `0053`.
M25 uses `0054`–`0056`.

| Migration | Table | Purpose |
|---|---|---|
| `0054_firm_templates.sql` | `firm_templates` | one row per Template exported or installed on this machine: `id`, `template_id`, `version`, `publisher`, `manifest_hash`, `kind ∈ {exported, installed}`, `status`, `created_at` |
| `0055_template_manifest.sql` | `template_manifest` | the export manifest projection: `template_row_id`, `org_chart_json`, `pack_selection_json` (the `PackRef` list), `structural_canon_ids_json`, `boundary_attestation_json`, `partition_version` |
| `0056_template_provenance.sql` | `template_provenance` | the import birth record (§4.9): `template_id`, `template_version`, `template_hash`, `installed_at`, `installed_by_seat`, `genesis_event_id` — at most one row per Vault |

All additive; no existing column's meaning changes. A Firm that never exports or installs a Template has three
empty tables and behaves exactly as it did pre-M25 (G9). The `template_manifest` projection is rebuildable from
a stored Template artifact, per the "entity tables are projections" rule (`04-database-design.md` §1).

Crucially, **none of these tables holds operational data**. `template_manifest` holds the *structure* that was
packaged and the *ids* of structural Canon — never engagement, memory, or budget content. `template_provenance`
holds a hash and the target's own Seat — never a link into the source's data.

### 11.2 Domain events

Every event carries `actor` (the acting Seat), `template_id`, and `manifest_hash`, and lands on the hash chain
(ADR-0002):

`TemplateSelectionStarted` · `TemplateBoundaryCheckPassed` · `TemplateBoundaryCheckFailed` · `TemplateExported`
· `TemplateAcquired` · `TemplateValidated` · `TemplateInstallRefused` (carries the reason:
`vault_not_empty` \| `pack_unavailable` \| `boundary_failed` \| `untrusted`) · `TemplateInstalled` ·
`TemplateProvenanceRecorded`.

`TemplateInstalled` is, on the reproduced Firm, the second event on its chain (after genesis) — the birth
event. It references the Template hash, not the source Firm; the reproduced chain has no ancestor in the
source's chain (ADR-0002).

### 11.3 Vault Markdown mirror (v1 rule — the archive outlives the software)

```
~/Sidra/
└── templates/
    ├── exported/
    │   └── sidra-systems-core-1.0/
    │       ├── template.md          org chart, Pack list, structural-Canon statements — human-readable
    │       └── attestation.md       what the boundary check inspected and found clean
    └── provenance.md                "this Firm was installed from <Template> at <time>" — one file, if applicable
```

Written on state transitions, not continuously. A Principal who abandons Sidra OS keeps a readable record of
every Template they exported (its shape and its clean-boundary attestation) and, if their Firm was born from a
Template, a one-line birth record — but never any of a *source* Firm's data, which was never in the Template to
begin with.

---

## 12. Effect classes and the Decision model

Export and install are both **class-3 by consequence** in the Principal-facing sense — they are not reversible
casual actions:

- `export_firm_template` produces an artifact that *leaves the machine* and describes the Firm. Like publishing
  (Marketing's effect ceiling 3, `04-department-catalog.md` §16), it always asks, and it always shows the exact
  contents first (§10.3 rule 2). The boundary check is the safety interlock; the Decision is the consent.
- `install_firm_template` writes a whole org chart and installs multiple Packs into a Vault. It is a Decision,
  logged, shown in full (org chart + Pack list + Canon statements) before the act. It grants nothing, so it
  cannot *directly* enable an effect — but it changes what the Firm *is*, which is a Principal-level change.

Neither is available to an agent. Portability is a Principal-and-Seat operation; no charter grants
`export_firm_template` or `install_firm_template`, and the manifest namespace has no `portability:*` capability
an agent could hold. This is the same posture as the Marketplace itself: an agent cannot install a Pack, and it
certainly cannot export the Firm.

---

## 13. Sequence diagrams

### 13.1 Export a Firm Template (select → boundary check → package → sign)

```
Principal        Portability(Exporter)     BoundaryCheck     Marketplace(Signer)     Chain
   │  select(org chart, packs)  │                │                   │                 │
   ├───────────────────────────►│ gather structure (§5 structure side only)            │
   │  preview_structural_canon  │                │                   │                 │
   ├───────────────────────────►│ list eligible identity Canon (§5.3)                  │
   │◄──── eligible statements ──┤                │                   │                 │
   │  export(selection, chosen_canon)            │                   │                 │
   ├───────────────────────────►│ assemble artifact                  │                 │
   │                            ├── run boundary check ─────────────►│                 │
   │                            │◄── PASS (no data-side item) ───────┤                 │
   │                            │ build manifest + BoundaryAttestation                 │
   │                            ├── sign (ADR-0006 chain) ──────────────────────►│      │
   │                            │◄──────────── signed artifact ─────────────────┤      │
   │                            ├── TemplateExported ──────────────────────────────────►│
   │◄──── signed Template ──────┤ (a Principal Decision, contents shown first)          │
```

### 13.2 Install into an empty Vault — the exit criterion (reproduce structure, zero data)

```
Principal   Portability(Importer)  EmptyVaultGuard  Marketplace  Registrar(M13)  Store   Chain
  │ install(template) │                 │              │             │            │        │
  ├──────────────────►│ verify signature + re-run boundary check (§7.6)           │        │
  │                   │ vault empty? ───►│ yes (schema migrated, 1 Seat, data side empty)   │
  │                   │◄── ok ───────────┤              │             │            │        │
  │                   ├── resolve PackRefs ─────────────►│ all present at pinned hash        │
  │                   │◄── resolved Packs ───────────────┤             │            │        │
  │            ┌──────┤  BEGIN TRANSACTION                             │            │        │
  │            │      ├── install each Pack (twelve checks, M13) ─────►│            │        │
  │            │      ├── write org chart (Divisions/Offices/depts/heads) ────────►│        │
  │            │      ├── instantiate eager heads (ADR-0014) ─────────►│            │        │
  │            │      ├── write structural Canon ──────────────────────────────────►│       │
  │            │      │  ── GRANT NOTHING ──  ── WRITE NO EVENT/ENGAGEMENT/MEMORY/BUDGET ──  │
  │            └──────┤  COMMIT                                        │            │        │
  │                   ├── append TemplateInstalled (birth event) ─────────────────────────►│
  │                   ├── record provenance (target's own Seat) ──────────────────►│        │
  │◄── Reproduced ────┤  same shape · zero source data · nothing granted           │        │
```

### 13.3 The boundary refusal (a Template that would carry data → refused before signing)

```
Principal        Portability(Exporter)     BoundaryCheck
   │  export(selection incl. a memory-derived Canon row)  │
   ├───────────────────────────►│ assemble artifact       │
   │                            ├── run boundary check ───►│  §5.3: source_type='inference' → INELIGIBLE
   │◄── Refused{data_present:   ┤◄── FAIL(canon.source_type=inference) ──
   │      canon/inference} ─────┤ (nothing packaged, nothing signed, nothing left the machine)
```

### 13.4 The non-empty-Vault refusal (install target already a Firm → defined behaviour)

```
Principal   Portability(Importer)  EmptyVaultGuard
  │ install(template) │                 │
  ├──────────────────►│ verify signature; re-run boundary check (PASS)
  │                   │ vault empty? ──►│  data-side tables non-empty (engagements present)
  │◄── Refused{vault_not_empty} ────────┤  (nothing installed; the existing Firm is untouched — §7.5, F2)
```

---

## 14. Failure scenarios

| # | Scenario | Handling |
|---|---|---|
| F1 | A selection would carry an operational datum (engagement id, memory chunk, budget figure, derived Canon, Seat) | The boundary check (§7.2) refuses at Selected → Validated, naming the offending kind. Nothing is packaged or signed. The export engine cannot even read most of it (§6). |
| F2 | Install into a **non-empty** Vault | `EmptyVaultGuard` refuses with `vault_not_empty`; the existing Firm is untouched (§7.5). Merging into a live Firm is out of scope and would need its own ADR. |
| F3 | A referenced Pack is unavailable at install (unpublished, wrong version, hash mismatch) | Refused with `pack_unavailable{pack_id, version}` before the transaction commits; the Vault stays empty (invariant §3.3.3). No partial Firm. |
| F4 | The Template's shipped bytes fail the boundary check at the *importer* despite a clean attestation | Refused with `boundary_failed`; the importer's re-check (§7.6) is authoritative. Nothing is installed. |
| F5 | The signature is missing or the publisher is untrusted | Same as any Marketplace artifact (`05-marketplace-and-packs.md` §3): blocked outside developer mode; community-tier requires full scroll-to-end review. |
| F6 | Install fails midway (write error, Pack install failure) | The transaction rolls back; the Vault returns to empty. `TemplateInstallRefused` logged. No observable half-install (invariant §3.3.3). |
| F7 | A structural-Canon statement the Principal *did not* opt into appears in the Template | Impossible: `export_firm_template` includes only entries from the explicit `chosen_canon` selection (§10.3 rule 4). A statement not chosen is not in the artifact; the boundary check would in any case catch an unchosen data row. |
| F8 | The reproduced Firm can act (an agent runs) immediately after install, before any grant | Impossible: install grants nothing (§7.3). Departments are capability-idle until the Principal grants. An agent invoking an effect is denied by the Broker (M3) for lack of a grant — the same refusal as a freshly Pack-installed, un-granted department. |
| F9 | A future milestone adds a table nobody classified | It is *data* by default (§5.2); the export engine has no edge to reach it (§6), and the boundary check treats unknown as excluded. Forgetting to classify leaks nothing. |

---

## 15. Performance and offline

- **Export is bounded by structure size, not Firm size.** A Template is the org chart (tens of nodes), a Pack
  reference list (≤21 entries, `04-department-catalog.md`), and a handful of structural-Canon statements. It
  does not scale with the Firm's history — a Firm with a million events exports the same-sized Template as a
  fresh one. This is a direct consequence of carrying structure, not data.
- **Install is bounded by Pack resolution.** The cost of install is the cost of installing the referenced
  Packs (M13/M14 install), plus writing a small graph. It is comparable to a first-run Firm setup, because it
  *is* a first-run Firm setup driven by a manifest.
- **Offline is the default-safe state (Layer-8 replaceability).** Export produces a local artifact and needs no
  network. Install needs the Marketplace only to *resolve referenced Packs*; if the Packs are already present
  locally (the common internal case, `05-marketplace-and-packs.md` §7), install is fully offline. A Template
  never contacts the source Firm, ever (§7.1 T-phone-home).
- **Nothing about portability touches the scheduler.** Export and install are Principal Decisions run outside
  any Mission; the Mission scheduler's determinism (M15 §17) is unaffected.

---

## 16. Dependencies, assumptions, risks

### 16.1 Dependencies

| On | For |
|---|---|
| **M14 — Marketplace / Pack machinery** (ADR-0013, `05-marketplace-and-packs.md`) | the distribution mechanism: acquire/install/grant, trust tiers, signing (ADR-0006), the twelve checks; a Template is a sibling artifact reusing all of it |
| **M21 — Seats** (ADR-0021) | the seat model a Template is agnostic to; the target Vault's single Seat is the actor for install and provenance |
| M13 — departments & Registrar | the Registrar writes the reproduced org chart and instantiates heads (ADR-0014) |
| M2 — event log (ADR-0002) | `TemplateExported`/`TemplateInstalled` on the hash chain; the reproduced Firm's own genesis |
| M3 — security kernel | the redaction/secret scan reused in the boundary check (§7.2); the Broker that keeps a reproduced-but-ungranted department idle (F8) |

### 16.2 Assumptions

1. The Marketplace/Pack machinery (M14) is present and the referenced Packs are resolvable (published, or
   present locally). If a Pack is not resolvable, install refuses cleanly (F3) — the assumption failing is a
   named refusal, not a corrupt install.
2. The Seat model (M21) is present; an empty Vault has exactly one Seat (ADR-0021). If the Firm runs as a
   single implicit Seat, that Seat is the install actor; the model is unchanged.
3. Templates in M25 reproduce *structure into an empty Vault only*. Merging into a populated Firm, and
   "diffing" one Template against another, are out of scope and each would need its own ADR (§7.5).
4. The structure/data partition (§5) is complete for every table through M24. New tables introduced after M25
   default to *data* until an ADR classifies them (§5.2, F9).

### 16.3 Risks

| # | Risk | Mitigation |
|---|---|---|
| PR-1 | An operational datum leaks into a Template | Four barriers: no dependency edge (§6), the boundary check (§7.2), the importer re-check (§7.6), the CI boundary test (§18). Any one catching it is sufficient; all four run. |
| PR-2 | The structure/data partition is incomplete and a new table leaks | Default-excluded (§5.2); the export engine cannot reach an unclassified store (§6). Classification is an explicit, reviewed act with an ADR when a table moves to *structure*. |
| PR-3 | An install silently grants authority | Structurally impossible — no grant field (§4.2), install ends at install (§7.3), F8 asserts a reproduced department is idle. The CI boundary test also asserts zero grants post-install. |
| PR-4 | Structural Canon becomes a data smuggling channel | Eligibility is type-constrained and row-level (§4.7, §5.3); inclusion is opt-in per statement (G7); the boundary check re-validates every included row. |
| PR-5 | A Template ships a tampered Pack | Packs are referenced by pinned hash, not embedded (§4.6); install verifies the resolved Pack's manifest hash and runs the twelve checks (T-pack-substitution). |
| PR-6 | Migration breaks a pre-M25 Firm | Forward-only, additive (`0054`–`0056`); null template = pre-M25 behaviour (G9); each migration independently deployable (`04-database-design.md` §10). |

---

## 17. Acceptance criteria

The exit criterion decomposed into testable claims. **These are the contract with AntiGravity.** The exit
criterion — *a Firm Template installs into an empty Vault and reproduces the source Firm's structure without
its data* — is AC4–AC9 together, and AC7–AC9 (the *zero-data* proof) are the last thing to go green.

| # | Claim | Proven by |
|---|---|---|
| AC1 | A Template exports from a valid structure selection + signature; any boundary-check failure is a hard refusal naming the rule, with no override | export-check test over a corpus of selections including deliberately data-tainted ones |
| AC2 | A Template's manifest can carry no capability grant, no Seat, no event/engagement/memory/budget — the schema has no field for them | schema/type test asserting the absent fields are unrepresentable |
| AC3 | The export engine has no dependency edge to `services/orchestrator`, `services/mission`, or any operational-data / memory-content service | dependency-direction check in CI (§18) |
| AC4 | **A Template installs into an empty Vault** and completes; an install into a non-empty Vault is refused `vault_not_empty` with the existing Firm untouched | install test + non-empty-Vault refusal test (§13.4) |
| AC5 | The reproduced Firm has the **same org chart** (Divisions, Offices, departments, edges, veto scopes, head assignments) — a graph isomorphism holds | org-chart isomorphism test over a source→export→install fixture |
| AC6 | The reproduced Firm has the **same Pack selection** (ids, versions, tiers, twelve-check pass) and the **same charter set** and **same structural Canon** the Principal chose | Pack-parity + archetype-parity + Canon-parity assertions |
| AC7 | The reproduced Firm holds **zero** source events (beyond its own genesis+install), engagements, mandates, work orders, deliverables, reviews, briefs, decisions, meetings | reproducibility test asserting COUNT = 0 on every Work/Governance table |
| AC8 | The reproduced Firm holds **zero** source memory (documents, chunks, vectors, derived playbooks), **zero** budget spend, and **zero** data Canon / reconciliations | reproducibility test asserting COUNT = 0 on every Memory/Execution/data-Canon table |
| AC9 | The reproduced Firm holds **zero** source Seats, Fences, working memory, connector grants/credentials, automations, and **zero** capability grants — install granted nothing | reproducibility test asserting COUNT = 0 on Seats/connector/grant tables; F8 idle-department assertion |
| AC10 | The importer independently re-runs the boundary check and refuses a Template whose bytes fail, regardless of its attestation | tamper test: a Template with a smuggled datum passes a forged attestation but is refused at install |
| AC11 | A referenced Pack unavailable at install is a named refusal (`pack_unavailable`) that leaves the Vault empty; install is atomic | Pack-unavailable + mid-install-failure rollback tests |
| AC12 | Every export/install/refusal is an audited event on the hash chain; the reproduced Firm's chain begins at its own genesis with no source ancestor | `audit.verify` over an export+install fixture; chain-ancestry assertion |

---

## 18. Testing strategy and CI requirements

### 18.1 Testing strategy

- **The reproducibility harness (the exit criterion).** Stand up a source Firm with a known org chart, a Pack
  selection, structural Canon, *and* a populated data side (engagements, memory, budgets, a second Seat).
  Export a Template. Install it into a freshly initialised empty Vault. Assert (a) org-chart isomorphism
  (AC5), Pack/charter/Canon parity (AC6); and (b) COUNT = 0 on every data-side table (AC7–AC9). The presence
  of real data on the source is essential — the test proves the boundary held under load, not that an empty
  Firm exports an empty Template.
- **Boundary corpus.** A corpus of selections each tainted with exactly one data-side item (an engagement id,
  a memory chunk, a budget figure, a derived-Canon row, a Seat, a capability grant). Each must be refused at
  export, naming its kind (AC1).
- **Importer re-verification.** A Template with a smuggled datum and a *forged* clean attestation must be
  refused at the importer (AC10).
- **Atomicity.** Inject a Pack-unavailable and a mid-install write failure; assert the Vault returns to empty
  (AC11).
- **Grant-nothing.** After a successful install, assert every grant table is empty and a department invoking
  an effect is denied by the Broker (F8, AC9).

### 18.2 CI requirements

| Check | Fails the build when |
|---|---|
| **Structure/data-boundary test** | any data-side table, column, or Vault path (per the §5 partition) can reach the export path, or appears in a produced Template fixture. This is the load-bearing CI gate: *if any operational datum is present in a Template, CI is red.* |
| **Grant-nothing test** | a reproduced Firm has any capability grant after install |
| **Dependency-direction check** | `services/portability` gains an edge to `services/orchestrator`, `services/mission`, or any operational-data/memory-content service (AC3, G8) |
| **Partition-completeness check** | a table exists in the schema that the §5 partition does not classify (forces every new table to be classified — as *data* by default, §5.2) |
| **Reproducibility acceptance** | the §18.1 harness fails any of AC5–AC9 |

---

## Appendix A — Glossary additions

- **Firm Template** — a signed Layer-8 Marketplace artifact describing the *structure* of a Firm: its org
  chart, its charter set (by reference), its Pack selection (by reference), and its opt-in structural Canon.
  Carries no operational data, no Seat, and no capability grant.
- **Portability engine** — the Layer-8 machinery (`sidra-portability`) that exports a Template from a running
  Firm and installs one into an empty Vault. Reuses the Marketplace/Pack trust chain; owns the boundary check.
- **Structure / data boundary** — the versioned partition (§5) of every table and Vault path into *structure*
  (exportable identity/shape) and *data* (excluded operations/history). The single source of truth for the
  export check, the import re-check, and the CI boundary test.
- **Structural Canon** — principal-sourced, firm-scoped, identity Canon eligible for inclusion in a Template by
  explicit per-statement Principal choice. Distinct from *data Canon* (facts derived from operations), which is
  excluded unconditionally.
- **Empty Vault** — a freshly initialised Vault: schema migrated, chain at genesis, exactly one Seat, every
  data-side table empty. The target the exit criterion is defined against.
- **Reproduction** — structural isomorphism between the source Firm's org chart / Packs / charters / structural
  Canon and the installed Firm's, with an empty data side. Not a copy; a rebuild from a manifest.
- **PackRef** — a reference to a Department Pack by id, version, trust tier, and pinned manifest hash. A
  Template carries PackRefs, never Pack bodies.

## Appendix B — Repository placement

```
services/
└── portability/                NEW — crate sidra-portability (Layer 8)
    ├── partition               the §5 structure/data partition, as data
    ├── exporter
    ├── boundary                export check + import re-check
    ├── packager
    ├── importer
    ├── reproducer
    ├── provenance
    └── conformance             the reproducibility harness (exit criterion)

agents/
└── templates/                  NEW — template.toml schema + fixtures only (no data, by construction)

services/store/migrations/      EXTENDED — 0054_firm_templates.sql · 0055_template_manifest.sql · 0056_template_provenance.sql (forward-only)

infrastructure/testing/
└── portability/                NEW — reproducibility harness, boundary corpus, importer re-verify, atomicity, grant-nothing

infrastructure/ci/              EXTENDED — structure/data-boundary test, grant-nothing test, dependency-direction check, partition-completeness check
```

Dependency direction (ADR-0011): `packages/domain ← services/portability ← apps/*`. `services/portability`
depends on `services/marketplace`, `services/departments`, `services/store`, `services/security`; it does
**not** depend on `services/orchestrator`, `services/mission`, or any operational-data/memory-content service —
and that absence is what makes "structure, not data" a property of the build rather than of a filter.

## Appendix C — Implementation position

M25 is the **last milestone of 3.0 "Chambers"** and closes the release (`/MILESTONE_REGISTRY.md` §4). It
depends on M14 (Marketplace) and M21 (Seats). Building portability before the Marketplace would mean inventing
a second distribution and trust mechanism — exactly the duplication ADR-0068 exists to prevent. Building it
before Seats would mean an export model with no defined notion of *whose* data is being excluded, which is the
gap ADR-0021 closed by putting a Seat identity on every record from 2.0.

**Exit criterion.** A Firm Template installs into an empty Vault and reproduces the source Firm's structure —
org chart, charters, Packs, structural Canon — while carrying **none** of its data, proven by asserting zero
source events, engagements, memory, budgets, Seats, and data Canon in the installed Vault (AC4–AC9).

**This milestone closes release 3.0. Do not begin M26 (4.0 "Continuum") until M25 is implemented, integrated,
and the template-into-empty-Vault exit criterion is demonstrated.**

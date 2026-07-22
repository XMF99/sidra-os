# M24 Architecture Audit — gate before M25

**Purpose.** STEP 1 of the workflow: before architecting the next milestone, verify the previous one is
architecturally sound as a *dependency* and report any gap. This audit gates M25 (Firm Templates and
Portability), the milestone that closes release 3.0 "Chambers".

| | |
|---|---|
| Milestone audited | M24 — Sync and Conflict Resolution |
| Registry status | **Defined** (architecture not yet written; `/MILESTONE_REGISTRY.md` §4, 3.0) |
| Audit verdict | **No M24 gap blocks M25.** M25 does not depend on M24; its declared dependencies (M14, M21) are architecturally present. |
| Authoritative sources | `/MILESTONE_REGISTRY.md` §4–§5, `/docs-v2/05-marketplace-and-packs.md`, `/docs-v2/adr/0021-seats-defined-in-2-shipped-in-3.md`, `/docs-v2/adr/0013-department-pack-as-unit-of-modularity.md` |

---

## 1. What M25 actually depends on

The registry is explicit about M25's dependencies, and M24 is **not** among them:

> **M25 — Firm Templates and Portability.** Depends on: **M14 (Marketplace), M21**.
> (`/MILESTONE_REGISTRY.md` §4, 3.0 "Chambers")

M25 sits at the end of 3.0 alongside M24 (`M24 sync · M25 firm templates`, §5 dependency graph), but the two
are siblings, not a chain. M25's dependency edges run to M14 (the Marketplace/Pack distribution machinery) and
M21 (Seats), plus the substrate every milestone assumes (M13 departments/Registrar, M2 event log, M3 security
kernel). This audit therefore verifies *those* dependencies, and confirms that nothing in the M24 problem
(multi-device convergence) is on M25's critical path.

| Required dependency | Present / defined | Location | Used by M25 for |
|---|---|---|---|
| **M14 — Marketplace / Pack machinery** | ✅ Documented | `/docs-v2/05-marketplace-and-packs.md`; ADR-0013 | distribution: acquire/install/grant, trust tiers, signing (ADR-0006), the twelve checks — a Template is a sibling artifact reusing all of it (ADR-0068) |
| **M21 — Seats** | ✅ Defined + ADR | `/MILESTONE_REGISTRY.md` §4; ADR-0021 | the seat model a Template is agnostic to; the target Vault's single Seat is the install actor |
| M13 — departments & Registrar | ✅ Documented | `/docs-v2/04-department-catalog.md`; ADR-0013/0014 | the Registrar writes the reproduced org chart and instantiates heads |
| M2 — event log | ✅ Documented | ADR-0002 | `TemplateExported`/`TemplateInstalled` on the hash chain; the reproduced Firm's own genesis |
| M3 — security kernel | ✅ Documented | `/docs/07-security-model.md` | the redaction/secret scan reused in the boundary check; the Broker that keeps an ungranted department idle |

All five are architecturally present. **M25 is safe to architect.**

## 2. Why M24's "Defined" status does not block M25

M24 (Sync and Conflict Resolution) is itself **Defined**, not Documented — its architecture is not yet written
(`/MILESTONE_REGISTRY.md` §4). That is not a gate on M25 for three reasons:

1. **No dependency edge.** M25 does not consume anything M24 produces. Sync is multi-device Vault convergence
   with the event log as the merge substrate; portability is single-Firm structure export into an *empty*
   Vault. A Template installs into a fresh Vault with one Seat and no history — the exact opposite of the
   populated, diverging, multi-device Vault M24 concerns itself with.
2. **The empty-Vault precondition sidesteps convergence entirely.** M25's exit criterion is defined against an
   *empty* Vault (architecture §7.5). There is no merge, no conflict, and no second device in the M25 path —
   so M24's merge semantics cannot affect M25's correctness.
3. **The dependency direction is correct.** M25 extends the substrate M14/M21 already provide; it modifies no
   M24 architecture (there is none to modify) and introduces no edge that would force M24 to be finished first.

## 3. Discrepancies noted (non-blocking)

Per the standing rule "if registry metadata appears stale compared to the work, note it and continue":

1. **M14 in the registry vs. the delivered Marketplace doc.** The registry (§4, 2.0) lists M14 as "Game Studio
   and Marketplace" with the nine-item acceptance list; the authoritative distribution machinery M25 reuses is
   `/docs-v2/05-marketplace-and-packs.md`. These are consistent — the Marketplace doc is the layer M14 ships —
   but a reader tracing "M14" should be pointed at that doc. Note only; no gap.
2. **ADR sequence.** The last recorded ADRs are 0034–0037 (M16, connector framework) in
   `/docs-v2/adr/README.md`; M17–M24 will have added their own. M25's ADRs are numbered **0067–0068** per the
   milestone instruction's pinned band, continuing the global sequence. If M17–M24 consumed numbers past 0066,
   AntiGravity should confirm 0067–0068 are free at integration and renumber only if a collision exists
   (registry rule: numbering is permanent once documented). Note only; does not gate M25.
3. **Migration band.** M16 migrations end at `0029`; M25 uses `0054`–`0056` per the pinned band, leaving
   `0030`–`0053` for M17–M24. If those milestones consumed a different range, AntiGravity should confirm
   `0054`–`0056` are free at integration. Additive and forward-only regardless (`/docs/04-database-design.md`
   §10). Note only.

## 4. Gate decision

M25's declared dependencies (M14 Marketplace, M21 Seats) and its substrate (M13, M2, M3) are architecturally
present. M24's unfinished state does not block M25 — there is no dependency edge between them, and M25's
empty-Vault precondition removes any interaction with sync/convergence. No M24 or M14/M21 architecture is
modified by the M25 package; M25 extends the distribution substrate the Marketplace already provides, which is
the correct dependency direction.

**Proceed to M25 (Firm Templates and Portability). This closes release 3.0 "Chambers".**

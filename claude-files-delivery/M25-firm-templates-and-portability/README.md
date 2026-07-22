# M25 — Firm Templates and Portability · Delivery Package

**For AntiGravity.** The complete architecture package for milestone M25 (Firm Templates and Portability),
release 3.0 "Chambers". Architecture and specification only — **no production code**, per the workflow.

**M25 closes release 3.0 "Chambers."** It is the last milestone of the release that admits colleagues.

## What this milestone delivers

The Layer-8 portability engine (`sidra-portability`): the machinery that **exports** a running Firm's
*structure* — its org chart, its charter set, its Department Pack selection, and its durable identity Canon —
into a signed, distributable **Firm Template**, and **installs** a Template into an **empty Vault** to
reproduce that structure while carrying **none** of the source Firm's data.

A Firm Template is a distributable bundle of **structure, not data**. It travels through the **existing
Marketplace/Pack machinery** (M14) as a larger sibling artifact with the same trust chain, and — like every
Marketplace artifact — **its installation grants nothing** (`/MASTER_IMPLEMENTATION_GUIDE.md` §3 item 8). It
carries **no** events, engagements, work orders, deliverables, memory content, budgets, **Seats**, or data
Canon.

**Exit criterion:** a Firm Template installs into an empty Vault and reproduces the source Firm's structure —
org chart, charters, Packs, structural Canon — without its data, proven by asserting zero source events,
engagements, memory, budgets, Seats, and data Canon in the installed Vault.

## Contents

| File | What it is |
|---|---|
| `00-M24-AUDIT.md` | STEP 1 gate: confirms M25's dependencies (M14, M21) are present and that M24's unfinished state does not block M25 |
| `FIRM_TEMPLATES_AND_PORTABILITY_ARCHITECTURE.md` | The architecture — the authority on behaviour |
| `adr/0067-firm-template-carries-structure-never-data.md` | The structure/data boundary: defined, versioned, enforced three ways |
| `adr/0068-firm-templates-distribute-through-marketplace-install-grants-nothing.md` | Distribution reuses the Marketplace; install grants nothing |
| `IMPLEMENTATION_PLAN.md` | E1–E7, tasks with complexity, dependencies, files, acceptance criteria, order |
| `REVIEW_CHECKLIST.md` | The gate confirming the package is complete and ready |

## The two decisions, in one line each

1. **Structure, not data (0067):** a Firm Template carries the org chart, charter set, Pack selection, and
   structural Canon — and *no* operational data. The boundary is a versioned partition, enforced by the
   dependency graph (the export engine cannot read data), a hard-refusal boundary check, and a CI test.
2. **Marketplace distribution; install grants nothing (0068):** a Template is one more signed Marketplace
   artifact under the acquire/install/grant model. Reproducing a Firm reproduces *which Packs are installed*,
   never *which capabilities were granted* — the Principal re-grants afterward.

## Reading order

1. `00-M24-AUDIT.md` — why it was safe to start M25
2. `FIRM_TEMPLATES_AND_PORTABILITY_ARCHITECTURE.md` — §1 (stance) and §5 (the structure/data boundary) first,
   then §7 (security), §8 ("reproduces the structure", precisely), then the ADRs
3. The two ADRs — the load-bearing decisions
4. `IMPLEMENTATION_PLAN.md` — what to build, in order
5. `REVIEW_CHECKLIST.md` — confirm ready before starting

## Integration notes for AntiGravity

- Confirm ADRs `0067`–`0068` and migrations `0054`–`0056` are free after M17–M24 land; renumber only on a real
  collision (numbering is permanent once documented — registry rule 4). See `00-M24-AUDIT.md` §3.
- Copy the two ADRs to `docs-v2/adr/`, add rows to `docs-v2/adr/README.md`, mark `Accepted` on approval.
- Migrations are additive and forward-only: `0054_firm_templates`, `0055_template_manifest`,
  `0056_template_provenance` — none holds operational data.
- Dependency direction is CI-enforced: `sidra-portability` must not import `sidra-orchestrator`,
  `sidra-mission`, or any operational-data/memory-content service. That absent edge *is* the "structure, not
  data" guarantee (ADR-0067).
- On completion, update `MILESTONE_REGISTRY.md` M25 status `Defined → Documented`; the number is permanent
  from that point.

**Then STOP — this closes release 3.0 "Chambers".** Do not begin M26 (4.0 "Continuum") until M25 is
implemented, integrated, and the template-into-empty-Vault exit criterion is demonstrated (AC4–AC9, task T7.9).

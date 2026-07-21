# Sidra OS — Architecture Version 2.0

**Version 1.0 (`/docs`, 55 documents) remains the source of truth for everything it covers.** This set does
not replace it, restate it, or contradict it. It extends it.

## What changed

Version 1.0 designed a personal AI operating system: one Principal, one Firm of eleven agents, one machine.
Version 2.0 turns that Firm into the internal operating system of **Sidra Systems** — a technology company
that builds software, desktop applications, web platforms, mobile apps, AI systems, business systems and ERP,
automation, infrastructure, DevOps, cybersecurity, cloud systems, games, research, and future technologies.

The thing that changes is **scale and modularity**, not philosophy. All ten Principles hold. The event log,
the capability model, the Fences, the Work Order contract, the memory layers, the Night Atrium shell, and the
plugin host are all reused unchanged. What v2 adds is the organisational machinery that lets one Firm carry
twenty-one departments without collapsing into either a monolith or a crowd.

## The three structural additions

1. **Divisions** between the Executive and the departments, because a span of control of twenty-one is not a
   structure — it is a queue. (ADR-0012)
2. **Department Packs** — each department is an isolated, versioned, installable module owning its own
   agents, memory namespace, workflows, tools, standards, and dashboards. (ADR-0013)
3. **Roles as archetypes** — the Firm declares roles and instantiates agents lazily, so twenty-one
   departments do not require two hundred hand-written charters. (ADR-0014)

## Reading order

| # | Document | What it settles |
|---|---|---|
| 1 | [00-overview/01-v1-review.md](00-overview/01-v1-review.md) | Every v1 document: keep, evolve, or extend |
| 2 | [00-overview/02-v2-principles.md](00-overview/02-v2-principles.md) | Four additional principles, and why the original ten are untouched |
| 3 | [01-enterprise/01-enterprise-architecture.md](01-enterprise/01-enterprise-architecture.md) | The whole system at v2 scale |
| 4 | [01-enterprise/02-layer-model.md](01-enterprise/02-layer-model.md) | Core Platform → Executive → Departments → Specialists → Applications → Integrations → Plugins → Marketplace |
| 5 | [01-enterprise/03-department-architecture.md](01-enterprise/03-department-architecture.md) | What a department *is*: the Pack contract, isolation, expansion |
| 6 | [01-enterprise/04-department-catalog.md](01-enterprise/04-department-catalog.md) | All twenty-one departments specified |
| 7 | [01-enterprise/05-marketplace-and-packs.md](01-enterprise/05-marketplace-and-packs.md) | Distribution, signing, versioning, trust |
| 8 | [02-organization/01-org-chart-v2.md](02-organization/01-org-chart-v2.md) | Divisions, Offices, vetoes, escalation |
| 9 | [02-organization/02-agent-architecture-v2.md](02-organization/02-agent-architecture-v2.md) | Archetypes, instances, lifecycle, cross-department protocol |
| 10 | [02-organization/03-executive-cabinet.md](02-organization/03-executive-cabinet.md) | The eight executives and their charters |
| 11 | [03-game-studio/01-repository-analysis.md](03-game-studio/01-repository-analysis.md) | Claude-Code-Game-Studios, analysed |
| 12 | [03-game-studio/02-game-studio-department.md](03-game-studio/02-game-studio-department.md) | The Game Studio Department |
| 13 | [03-game-studio/03-integration-plan.md](03-game-studio/03-integration-plan.md) | Exactly how the repository becomes a Department Pack |
| 14 | [04-migration/01-migration-strategy.md](04-migration/01-migration-strategy.md) | v1 → v2 without breaking anything |
| 15 | [04-migration/02-implementation-changes.md](04-migration/02-implementation-changes.md) | Changes to milestones, schema, folder tree, tests |
| 16 | [04-migration/03-roadmap-changes.md](04-migration/03-roadmap-changes.md) | What moves, what is added, what is deferred |
| 17 | [05-risk/01-risk-analysis.md](05-risk/01-risk-analysis.md) | What can go wrong at enterprise scale |
| 18 | [adr/](adr/) | ADR-0012 – ADR-0021 |

## Rules for this set

- **v1 wins on anything it covers.** If a v2 document appears to contradict a v1 document, the v1 document is
  correct and the v2 document is a defect. The only exceptions are the ten items explicitly listed as
  superseded in [00-overview/01-v1-review.md](00-overview/01-v1-review.md), each of which has an ADR.
- **The glossary is still `/docs/00-vision/03-glossary.md`.** New terms introduced here are additive and are
  listed in [00-overview/02-v2-principles.md](00-overview/02-v2-principles.md) §4.
- **No implementation.** This remains a design set. Nothing here authorises writing production code.

## Status

| Field | Value |
|---|---|
| Extends | Sidra OS 1.0 "Atrium" (`/docs`, 55 documents) |
| Target release | Sidra OS 2.0 "Concourse" |
| Scope | One Firm, twenty-one departments, single Principal; multi-seat prepared, not shipped |
| Implementation | Not started, by intent |

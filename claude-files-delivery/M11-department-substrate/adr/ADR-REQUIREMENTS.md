# M11 — ADR Requirements

**No new ADR is required.** M11 implements decisions already recorded. Creating new ADRs would duplicate
them, which the project rules forbid.

| ADR | Decision | M11 use |
|---|---|---|
| ADR-0013 | Department Pack as the unit of modularity | The manifest contract + twelve install checks (E2) |
| ADR-0014 | Role Archetypes and lazy instantiation | Archetype resolution + autoscale + idle retirement (E2) |
| ADR-0016 | Standards & Guards as kernel primitives | Standards Engine (E3) + Guard Runner (E4); twelve→fourteen message kinds |
| ADR-0017 | Registries as department-owned Canon projections | Append-only registry store + Canon promotion path (E3) |
| ADR-0002 | Event log as source of truth | Additive event kinds; projection rebuild; the replay proof (E7) |
| ADR-0006 | Wasm component plugins | Guard Runner Tier-2 validator interface (E4) |
| ADR-0010 | Typed durable Work Orders | Exchange requests are Work Orders + two fields; quarantine resume (E5/E6) |

## Confirmation
If implementation surfaces a genuinely undecided boundary (none is anticipated — the sources are complete),
raise a new ADR at the next free number (0038+) and reference it here. Do not decide in code.

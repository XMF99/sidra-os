# M13 — ADR Requirements

**No new ADR is required.** M13 implements decisions already recorded.

| ADR | Decision | M13 use |
|---|---|---|
| ADR-0013 | Department Pack as the unit of modularity | Frozen Pack format + twelve checks + three-act install (E1) |
| ADR-0014 | Role Archetypes + lazy instantiation | Instances created on demand from the seven Packs' archetypes (E3) |
| ADR-0016 | Standards & Guards as kernel primitives | Standards inheritance + conflict at install (E2) |
| ADR-0017 | Registries as department-owned Canon projections | Registry query API + Canon promotion (E2) |
| ADR-0020 | A fourth budget ceiling at the department | Per-department budget enforced under real load (E4 cost attribution) |
| ADR-0006 | Wasm component plugins | Pack `tools/` + Pack signing via the plugin trust chain (E1) |

## Note for M16 integration
M13's agent→department resolver (E1/T1.4) is the API ADR-0035 (M16) assumes. When M16 is re-integrated, wire
its connector host to this resolver rather than to a caller-supplied department argument. That is an M16
integration step, recorded in the M16 review checklist — not a new ADR.

## Confirmation
No open decision at M13. Any genuinely new boundary → new ADR at the next free number (0038+), referenced here.

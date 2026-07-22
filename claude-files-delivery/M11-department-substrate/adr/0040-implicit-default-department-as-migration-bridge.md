# ADR-0040 — The implicit default department as the migration bridge

**Status:** Proposed · **Date:** M11 design phase · **Milestone:** M11 — Department substrate

## Context

M11 introduces the department boundary primitive into the kernel (`/docs-v2/03-department-architecture.md`;
ADR-0013). Its exit criterion is that the running v1 Firm behaves byte-for-byte identically and nothing is
visible to the Principal (`/docs-v2/02-implementation-changes.md` §1 M11; `/MILESTONE_REGISTRY.md` §4). This is
a tension: every code path that consults a department must now find one, yet the eleven v1 agents are *not
migrated* — they keep their IDs, memory, history, and KPI records, and are merely reinterpreted
(`/docs-v2/01-migration-strategy.md` §3).

The question is how a v1 record — an agent, a Work Order, a memory chunk — participates in a boundary substrate
without any of its behaviour changing. The compatibility contract requires every new field to be optional with
a v1-equivalent default (`/docs-v2/01-migration-strategy.md` §2), but "the field is null" is not by itself an
answer to "which department is this agent in" once the kernel resolves departments everywhere.

## Options

1. **Null everywhere, special-cased in each component.** Each kernel component checks "is `department_id`
   null?" and branches to v1 behaviour. Cheap, and it scatters the migration logic across the Broker, Memory,
   Gateway, and orchestrator — four places to keep consistent, and a `null` branch is one edit away from a
   `department == …` branch, which the kernel-neutrality rule forbids (`/docs-v2/02-layer-model.md` §1).
2. **Migrate every v1 record into a named department at upgrade.** A real "Software Engineering" department, a
   real "Product" department, populated by a data migration. Violates "there is no migration event"
   (`/docs-v2/01-migration-strategy.md` preamble) and makes step 5 (the *visible* re-expression) mandatory at
   M11 rather than at M12 — the exact ordering mistake M11 exists to avoid.
3. **A single implicit default department (`__default__`), substrate-generated, with every face set to its
   v1-equivalent null.** A v1 record with a null scoping resolves to `__default__` at read time; nothing is
   rewritten. The boundary is structurally present and behaviourally absent.
4. **No department object at M11; add it at M12.** Defers the primitive, but then M11 delivers no substrate and
   M12 must build both the primitive and the visible structure at once — collapsing the two milestones whose
   separation is the whole point of the sequencing (`/MASTER_IMPLEMENTATION_GUIDE.md` §5).

## Decision

Option 3. The substrate seeds exactly one **implicit default department**, id `__default__`, at upgrade time.
Every face carries its null value: memory namespace `None` (the global v1 namespace), capability ceiling equal
to the Principal-approved firm capability set (no narrowing), budget sub-ceiling `share = 1.0` with the v1
monthly ceiling as its hard cap (the fourth ceiling collapses onto the third, ADR-0020), empty filesystem
scope (v1 unscoped writes), and no contracts (so no cross-department request is ever formed).

A v1 record with a null scoping resolves to `__default__` at read time; **no record is rewritten**
(`/docs-v2/01-migration-strategy.md` §3). Resolution reads a field off a resolved `Department` value, never a
name, so the kernel-neutrality rule holds (`/docs-v2/02-layer-model.md` §1); the one construction site of
`__default__` is allowlisted by the neutrality grep and is data, not a behavioural branch.

`__default__` is a reserved id that no Department Pack may register (install refusal), so the bridge can never
collide with a real department installed at M13.

## Consequences

**Accepted: a reserved id the kernel-neutrality grep must allowlist.** Exactly one construction site is
permitted; any other occurrence of `__default__` in a kernel crate fails the build. This is a narrow, testable
exception, but it is an exception and must be guarded (M11-R2).

**Accepted: a synthetic department with no Pack.** The implicit default has no `department.toml`, so it is the
one department that does not arise from an installable artifact. Every query and projection must tolerate a
Pack-less department. Real cost, paid once.

**Accepted: "which department" is answered by resolution, not by storage, for v1 records.** A reader must
resolve null → `__default__` rather than read a stored id. This is a read-time indirection on the hottest path;
it is a constant-time lookup and does not regress the latency gate (`/docs-v2/01-risk-analysis.md` R-01), but it
is code that did not exist in v1.

**Gained: byte-identical behaviour with the boundary installed.** Every face resolved to its null reproduces v1
exactly, which is precisely what the replay-equivalence test asserts (ADR-0041). The boundary is present in the
schema and transparent in behaviour — the state M11's exit criterion requires.

**Gained: the visible re-expression stays at M12.** Because the bridge is invisible, the Rail-changing step 5
of the migration sequence remains a separate, later, Principal-facing Decision
(`/docs-v2/01-migration-strategy.md` §4 step 5), preserving the M11/M12 separation the critical path depends on.

**Gained: one migration mechanism, not four.** The bridge lives in the substrate's resolution logic, not as a
null-branch replicated across every kernel component — which keeps the department-parametric refactor free of
name branches (ADR consistent with `/docs-v2/02-layer-model.md` §1).

**Reversal cost: low.** Turning off the substrate feature flag leaves the columns unread and the seed row inert
(`/docs-v2/01-migration-strategy.md` §5, steps 1–4). Setting every real department's share to 1.0 with no cap
restores v1 budgeting (ADR-0020 reversal). The bridge is additive and unwinds with the flag.

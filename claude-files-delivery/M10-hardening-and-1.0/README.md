# M10 — Hardening and 1.0 · Delivery Package

**Release 1.0 "Atrium" · closes the M1–M10 substrate · for AntiGravity**

Architecture and specification only — no production code. This package makes 1.0 shippable: it does not add
features, it proves the M1–M9 substrate survives crashes, corruption, migration, export/import, a second
security review, and thirty days of real use.

## Exit criterion (authoritative, from `docs/01-implementation-plan.md` §M10)

> Thirty days of dogfooding with **zero data-loss incidents, zero unlogged effects,** and every open defect
> either fixed or explicitly accepted in writing.

## What this milestone delivers

Crash-recovery matrix · corruption recovery · migration rehearsal from every prior schema version · full
export and re-import round-trip · a second security review including the prompt-injection corpus ·
performance regression suite in CI · signed installer and update channel · Principal-facing documentation.

## Contents

| File | What it is |
|---|---|
| `ARCHITECTURE.md` | The hardening architecture — recovery matrices, verification harnesses, release pipeline, the 22-point structure |
| `IMPLEMENTATION_PLAN.md` | Epics E1–E8, every task and subtask, AC, review steps, completion definitions |
| `REVIEW_CHECKLIST.md` | The gate: every item ✓/✗ |
| `adr/` | ADR requirements (no new ADR required — M10 is v1 hardening; governing ADRs listed) |

## Governing ADRs (existing — none re-decided)

ADR-0002 (event log source of truth), ADR-0003 (single-file encrypted Vault), ADR-0009 (no telemetry),
ADR-0010 (typed durable Work Orders), plus the whole `docs/07-security-model.md`. M10 introduces no new
architectural decision; it proves the existing ones under stress.

## Dependency

M10 depends on M1–M9 being present. **Per the verification audit (`../M16-VERIFICATION-AUDIT.md`), M1–M9 are
only partially implemented and unbuilt (no toolchain).** M10 cannot be *completed* until M1–M9 are real and
compile; this package specifies M10 so it is ready the moment that baseline exists.

**STOP after M14.** Do not prepare M15/M16/M17.

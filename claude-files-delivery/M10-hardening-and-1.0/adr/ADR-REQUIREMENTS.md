# M10 — ADR Requirements

**No new ADR is required for M10.** M10 is v1 hardening: it proves existing decisions under stress and adds
release machinery. Creating new ADRs here would duplicate decisions already recorded, which the project rules
forbid.

## Governing ADRs (existing, unchanged)

| ADR | Decision | Why M10 relies on it |
|---|---|---|
| ADR-0002 | Event log is the source of truth | Corruption recovery rebuilds projections from it (E2); crash recovery resumes from it (E1) |
| ADR-0003 | Single-file SQLCipher Vault + Markdown mirror | Export/import round-trip (E4); corruption recovery (E2) |
| ADR-0009 | No telemetry | The dogfood and diagnostics export send nothing; the egress-allowlist CI test (security model §10) is part of the release gate |
| ADR-0010 | Typed durable Work Orders | Crash-recovery exactly-once (E1) |

Plus `docs/07-security-model.md` in full — the injection corpus, key-leak scan, and effect-class property
test (E5) are reruns of controls it already specifies (§7, §9, §11).

## Confirmation

If, during implementation, a genuine new architectural decision surfaces (e.g. a recovery strategy the
security model does not cover), it must be raised as a new ADR at the next free number and referenced here —
**not** decided silently in code. As specified, none is needed.

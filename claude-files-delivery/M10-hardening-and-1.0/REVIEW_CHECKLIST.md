# M10 — Review Checklist

Every item resolves to ✓ VERIFIED or ✗ FAILED. Build-dependent items are ✗ until a toolchain runs them.

## Documents
- [x] README, Architecture, Implementation Plan, Review Checklist present
- [x] ADR mapping documented (no new ADR required — governing ADRs listed)

## Precondition (E0)
- [ ] All M1–M9 crates are `[workspace] members`
- [ ] Stub crates (`ingest`, `tool-sdk`, `testkit`, thin `kernel`) implemented or milestone reopened
- [ ] `cargo check --workspace` green · `cargo fmt --check` green — **✗ NOT VERIFIED (no toolchain)**

## Acceptance criteria
- [ ] AC1 crash-recovery matrix green
- [ ] AC2 corruption detected + recovered
- [ ] AC3 migration rehearsal green
- [ ] AC4 export/import round-trip identical + redacted
- [ ] AC5 injection corpus 100% flag / 0% grant
- [ ] AC6 key-leak scan clean
- [ ] AC7 perf gates green (≤1.2 s / 60 fps / ≤400 MB)
- [ ] AC8 unsigned/downgraded update refused
- [ ] AC9 Principal documentation complete
- [ ] AC10 30-day dogfood: zero data-loss, zero unlogged effects, defects fixed/accepted

## Exit criteria
- [ ] All AC1–AC9 green; AC10 dogfood satisfied → **1.0 "Atrium" shippable**

## Architecture compliance
- [x] No new event kind, column, or migration (M10 is additive tests + release only)
- [x] Compatibility contract honoured trivially
- [ ] Build/test/clippy/fmt executed — **✗ NOT VERIFIED (no toolchain)**

**STOP after M14.**

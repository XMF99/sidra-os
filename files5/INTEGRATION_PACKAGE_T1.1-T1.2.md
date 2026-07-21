# Integration Package — M15 / E1 / T1.1 + T1.2

**For AntiGravity.** Everything needed to integrate, build, and validate the first two tasks of the Mission
Engine domain model.

| | |
|---|---|
| Milestone | M15 — Mission Engine (see `/MILESTONE_REGISTRY.md`; formerly labelled M10, ADR-0032) |
| Epic | E1 — Mission Domain Model |
| Tasks | T1.1 (crate scaffold + dependency-direction check) · T1.2 (value objects) |
| Crate | `sidra-mission` at `services/mission/` |
| Compiled | **No.** No Rust toolchain was available to the author. See §9. |
| Blocks | T1.3 does not start until this package is integrated and validated |

---

## 1. Scope

**In scope:** twelve files delivering a buildable, CI-gated, zero-dependency crate containing nine domain
value objects and 42 tests.

**Out of scope:** aggregates (T1.3–T1.8), events (T1.9), serde (T1.10). Nothing is stubbed ahead of the task
that owns it — if you find a placeholder, it is a defect, report it.

**Authoritative specifications.** `/MISSION_ENGINE_ARCHITECTURE.md` decides behaviour;
`/docs-v2/03-Intelligence/MISSION_ENGINE_IMPLEMENTATION_PLAN.md` decides scope. Where this package appears to
contradict either, this package is wrong.

---

## 2. File manifest

Verified against the delivered tree. Line counts and hashes are of the files as handed over, **before** the
patch in §4.

### 2.1 New files

| # | Path | Lines | sha256 (first 16) | Task | Purpose |
|---|---|---:|---|---|---|
| 1 | `Cargo.toml` | 25 | `ce26fe31f51e31cd` | T1.1 | Workspace root (ADR-0011) |
| 2 | `.gitignore` | 12 | `29cd01f3d38dba6a` | T1.1 | `/target/`, `/workspace/` |
| 3 | `.github/workflows/mission.yml` | 59 | `48df7ca116ad8a9d` | T1.1 | CI triggers (ADR-0031) |
| 4 | `services/mission/Cargo.toml` | 25 | `c739a1ca72e39a55` | T1.1 | Crate manifest — **no dependencies** |
| 5 | `services/mission/src/lib.rs` | 57 | `21bab6fb24a3eb08` | T1.1, T1.2 | Crate root, lints, `FORBIDDEN_DEPENDENCY` |
| 6 | `services/mission/tests/dependency_direction.rs` | 62 | `29623edc99dbc411` | T1.1 | In-crate guard, 3 tests |
| 7 | `infrastructure/ci/check_dependency_direction.py` | 217 | `95d3de7316174efe` | T1.1 | The ADR-0022 enforcer |
| 8 | `infrastructure/ci/tests/test_check_dependency_direction.sh` | 108 | `15a64e553be07c15` | T1.1 | Checker self-test, 9 cases |
| 9 | `infrastructure/ci/README.md` | 25 | `f4db9171b5e63025` | T1.1 | How to run checks locally |
| 10 | `services/mission/src/domain/mod.rs` | 12 | `c20b216545820c9e` | T1.2 | Domain module root |
| 11 | `services/mission/src/domain/values.rs` | 849 | `36c34870f614bd84` | T1.2 | Nine value objects |
| 12 | `services/mission/tests/values.rs` | 552 | `6ec57c1d8b02826b` | T1.2 | 39 tests (29 unit, 10 property) |

### 2.2 Modified files

| Path | Change | Task |
|---|---|---|
| `README.md` | Status table: implementation begun, M15 E1 T1.1–T1.2. Repository-layout block gains `services/`, `infrastructure/`. | T1.1, T1.2 |

### 2.3 Directories to create

```
services/mission/src/domain/
services/mission/tests/
infrastructure/ci/tests/
.github/workflows/
```

### 2.4 Related documents already delivered — not part of this package

`ADR-0031` (`docs-v2/adr/0031-ci-workflows-split-from-ci-scripts.md`) records why item 3 sits in
`.github/workflows/` while items 7–9 sit in `infrastructure/ci/`. Read it before "tidying" that split.

---

## 3. Integration order

Each step leaves the tree in a state where the next step's failure is unambiguous.

1. **Workspace first** — items 1, 2, 4. Run `cargo metadata`. If the workspace does not resolve, nothing
   below is meaningful.
2. **Crate root** — item 5. `cargo build -p sidra-mission`. Compiles with no items beyond one `const` and one
   `mod` declaration; the `mod` will fail until step 3.
3. **Domain module** — items 10, 11, plus the patch in §4. `cargo build -p sidra-mission`.
4. **Tests** — items 6, 12. `cargo test -p sidra-mission`.
5. **CI scripts** — items 7, 8, 9. `bash infrastructure/ci/tests/test_check_dependency_direction.sh`.
6. **Workflow** — item 3.
7. **README** — §2.2.

---

## 4. Required patch — `Duration::parse` panics on non-ASCII input

**Apply this before building.** It is a defect in the delivered code, found during package preparation.

**File:** `services/mission/src/domain/values.rs`, currently line 654.

`str::split_at` panics when the index is not a UTF-8 character boundary. `Duration::parse("18µ")` splits at
byte 3 of a 4-byte string, mid-character, and **panics instead of returning `Err`**. A value object that
panics on malformed input defeats the purpose of the type.

**Before**

```rust
        let (digits, unit) = trimmed.split_at(trimmed.len() - 1);
        let multiplier = match unit {
```

**After**

```rust
        // Take the final character rather than the final byte: `split_at` panics when the
        // index falls inside a multi-byte character, and malformed input must return `Err`,
        // never panic.
        let unit_char = trimmed.chars().next_back().ok_or_else(malformed)?;
        let digits = &trimmed[..trimmed.len() - unit_char.len_utf8()];
        let multiplier = match unit_char {
            's' => 1_u64,
            'm' => 60,
            'h' => 3_600,
            'd' => 86_400,
            _ => return Err(malformed()),
        };
```

Delete the old `let multiplier = match unit { "s" => ... }` block, including its `_ => return Err(malformed())`
arm. Note the match arms change from string patterns (`"s"`) to char patterns (`'s'`).

**Add this test** to `services/mission/tests/values.rs`, inside the `Duration` section:

```rust
#[test]
fn duration_rejects_non_ascii_input_without_panicking() {
    for input in ["18µ", "18€", "١٨m", "18\u{00A0}m"] {
        assert!(
            Duration::parse(input).is_err(),
            "{input:?} must return Err, not panic"
        );
    }
}
```

**Verification:** the four inputs return `Err`; nothing panics. Please confirm this specific test in your
report.

---

## 5. Public API contract after integration

This is what must exist once integrated. Treat it as the acceptance surface: if a compile fix changes any
signature below, that is a design change and needs to come back to me.

### 5.1 `sidra_mission`

| Item | Kind | Contract |
|---|---|---|
| `FORBIDDEN_DEPENDENCY` | `pub const &str` | `"sidra-orchestrator"` — referenced by the in-crate guard |
| `domain` | `pub mod` | Pure, I/O-free |

### 5.2 `sidra_mission::domain::values`

| Type | Constructors | Accessors | Traits |
|---|---|---|---|
| `MissionId` | `parse` | `as_str`, `PREFIX` | `Display`, `FromStr`, `Clone`, `Debug`, `Eq`, `Ord`, `Hash` |
| `ObjectiveId` | `parse` | `as_str`, `PREFIX` | as above |
| `TaskId` | `parse` | `as_str`, `PREFIX` | as above |
| `IdempotencyKey` | `new`, `parse` | `task`, `version` | as above |
| `Weight` | `new` | `as_f64`, `MIN`, `MAX` | `Display`, `Copy`, `PartialOrd` (**no `Eq`/`Ord`/`Hash` — holds `f64`**) |
| `Money` | `from_minor_units`, `parse` | `minor_units`, `checked_add`, `checked_sub`, `ZERO` | `Display`, `FromStr`, `Copy`, `Eq`, `Ord`, `Hash` |
| `Duration` | `from_seconds`, `parse` | `as_seconds`, `checked_add`, `ZERO` | as `Money` |
| `EffectClass` | `from_u8` | `as_u8`, `MIN_VALUE`, `MAX_VALUE` | `Display`, `Copy`, `Eq`, `Ord`, `Hash` |
| `PriorityTier` | `from_rank`, `FromStr` | `rank`, `ALL` | as `EffectClass`, plus `Default` = `P2` |
| `ValueError` | — | — | `Display`, `Error`, `Clone`, `Debug`, `Eq` |

### 5.3 Canonical text forms

Taken from `/MISSION_ENGINE_ARCHITECTURE.md`. These are round-trip contracts.

| Type | Canonical form | ARCH § |
|---|---|---|
| `MissionId` | `msn_01J8KQ4Z9F3B7T2Y6R8N0M5V1C` | §5.1 |
| `ObjectiveId` | `obj.failover` | §5.2 |
| `TaskId` | `tsk.failover.runbook` | §6.1 |
| `IdempotencyKey` | `tsk.failover.runbook@v1` | §6.1 |
| `Money` | `$45.00` | §5.1 |
| `Duration` | `18m` | §6.1 |
| `EffectClass` | `0`–`3` | §5.1 |
| `PriorityTier` | `P0`–`P3` | §9.2 |

---

## 6. Acceptance criteria

### T1.1

| # | Criterion | How to verify |
|---|---|---|
| 1.1a | Crate builds | `cargo build --workspace --all-targets` |
| 1.1b | CI fails on any `sidra-mission` → `sidra-orchestrator` dependency | `bash infrastructure/ci/tests/test_check_dependency_direction.sh` — **9/9 must pass** |
| 1.1c | The checker covers transitive dependencies when cargo is present | Script prints `mode=metadata coverage=direct and transitive` |
| 1.1d | In-crate guard passes | `cargo test -p sidra-mission --test dependency_direction` — 3 tests |

Criterion 1.1b is the substance of T1.1. Asserting the current tree is clean does not test it — an empty crate
passes trivially. The self-test proves the checker *rejects* violations across direct, dev-, build-, and
target-specific dependency tables.

### T1.2

| # | Criterion | How to verify |
|---|---|---|
| 1.2a | Each type rejects invalid construction | Rejection-table tests, one per type |
| 1.2b | `Weight` constrained to `[0, 1]` | `weight_accepts_the_permitted_range`, `weight_rejects_values_outside_the_range`, `weight_rejects_non_finite_values`, plus the property test across `[-1, 2]` |
| 1.2c | `EffectClass` constrained to `0..=3` | Property test across all 256 `u8` values |
| 1.2d | Property tests present | `mod properties` — 10 tests, 5,000 samples each where generative |
| 1.2e | Zero I/O dependencies (E1 acceptance §3) | `cargo tree -p sidra-mission` shows no dependencies |
| 1.2f | No panic on malformed input | The §4 patch test |

**Full suite:** `cargo test --workspace` → **42 tests** (3 dependency-direction, 39 values), plus 1 after the
§4 patch = **43**.

---

## 7. Validation sequence

```
cargo fmt --all --check
cargo clippy --workspace --all-targets -- -D warnings
cargo build --workspace --all-targets
cargo test --workspace
cargo doc --workspace --no-deps            # RUSTDOCFLAGS="-D warnings"
python3 infrastructure/ci/check_dependency_direction.py .
bash infrastructure/ci/tests/test_check_dependency_direction.sh
```

`cargo fmt` will almost certainly reformat `values.rs` and `tests/values.rs` — the code was hand-written
without rustfmt available. **Accept whatever rustfmt produces**; formatting is not a design decision.

---

## 8. Anticipated integration issues

Ranked by likelihood. Suggested fixes are yours to accept or improve — none is a design decision.

| # | Risk | Symptom | Suggested fix |
|---|---|---|---|
| 1 | **`malformed` closure reused after move** in `Money::parse` and `Duration::parse`. It is passed to `ok_or_else(malformed)` and also called later. This relies on the closure being `Copy` (it captures only `raw: &str`). | `use of moved value: malformed` | Change `let malformed = \|\| ...` to a nested `fn`, or pass `\|\| malformed()` at the call site |
| 2 | **`#![deny(missing_docs)]` on struct-variant fields.** `ValueError`'s fields are documented, but rustc versions differ on whether they are required. | `missing documentation for a struct field` | Fields already carry `///`; if the opposite (unused-doc) fires, leave them |
| 3 | **`rust-version = "1.77"`** is a guess; nothing in the code demands it. Inline format captures need 1.58, `split_once` 1.52. | Toolchain resolution error | Lower to the workspace's actual MSRV; tell me what you set |
| 4 | **`Weight` lacks `Eq`/`Ord`/`Hash`** by design (holds `f64`). A collection keyed by `Weight` will not compile. | Trait bound errors in later tasks | Do not derive them. Report back; the design intends weights not to be keys |
| 5 | **Clippy may object to `#[must_use]` placement or `format!("{value}")`** in error paths | Clippy warnings under `-D warnings` | Apply clippy's suggestion; none of these carries meaning |
| 6 | **Workspace members listed explicitly**, not by the `services/*` glob ADR-0011 describes | None yet — one member | Leave as is; the explicit form makes adding a member a reviewed change |

---

## 9. What was not verified

Stated plainly because the workflow depends on knowing where verification actually happened.

1. **Nothing was compiled.** No `rustc`/`cargo` was available and `static.rust-lang.org` was blocked. `cargo
   build`, `cargo test`, `cargo clippy`, `cargo fmt` — none ran. **The 42 tests are unexecuted.**
2. **The dependency checker's `metadata` mode is unexecuted.** It ran only in `manifest` fallback mode
   (direct dependencies only). The transitive path is written but untested. Criterion 1.1c is your first
   confirmation of it.
3. **What *was* executed:** the checker's 9-case self-test (9/9 pass, in fallback mode), TOML parsing of both
   manifests, YAML parsing of the workflow, Python syntax of the checker, brace/paren/bracket balance across
   all five Rust files, and a doc-coverage scan showing every public item carries a doc comment.

---

## 10. Invariants — do not resolve these away

If a build or lint failure seems to require changing any of these, **stop and report it to me** rather than
fixing it. Each encodes a decision, and a plausible-looking fix would silently remove it.

| Invariant | Why | Source |
|---|---|---|
| `sidra-mission` declares **zero dependencies** | The planning/execution separation is a compile-time property, not a convention | ADR-0022, E1 acceptance §3 |
| Property tests use a **hand-rolled seeded LCG**, not `proptest` | Approved decision: no new dependencies during E1 | Approved 2026-07-21 |
| `serde` arrives at **T1.10**, not before | Same | Approved 2026-07-21 |
| `Money::checked_sub` returns `None` rather than saturating at zero | A budget that silently floors is a budget exceeded without anyone noticing | `ARCH` §16.3 |
| `Weight::new` rejects `NaN` | A weight comparing false against itself corrupts every completion calculation it enters | `ARCH` §15.2 |
| `MissionId` has **no generator**, only `parse` | Generation needs a clock and randomness; E1 must stay I/O-free | E1 acceptance §3 |
| `.github/workflows/` holds triggers; `infrastructure/ci/` holds the checks | Checks must be runnable locally by the exact command CI runs | ADR-0031 |
| `#![forbid(unsafe_code)]` and `#![deny(missing_docs)]` stay | — | T1.1 |

---

## 11. Report back

Please confirm:

1. **Build** — `cargo build --workspace --all-targets`: pass/fail, plus any edits you made to compile it.
2. **Tests** — count executed and count passed. Expected 43 after the §4 patch.
3. **The §4 patch** — applied, and `duration_rejects_non_ascii_input_without_panicking` passes.
4. **Criterion 1.1c** — did the checker report `mode=metadata coverage=direct and transitive`?
5. **MSRV** — what `rust-version` did you settle on?
6. **rustfmt/clippy** — anything that changed meaning rather than formatting.
7. **Any invariant from §10** you had to touch.

T1.3 (`Charter`) is specified and ready. I will not start it until you confirm this package is integrated and
validated.

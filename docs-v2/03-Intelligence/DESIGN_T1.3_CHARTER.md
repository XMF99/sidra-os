# Design Package — M15 / E1 / T1.3 — Charter

**For AntiGravity.** Architecture, rationale, reference implementation, acceptance criteria and integration
notes for the Mission Charter.

| | |
|---|---|
| Baseline | commit `2c99527b55365fc8555c6912c717626345834352` (T1.1 + T1.2 integrated, 43/43 green) |
| Task | T1.3 — `Charter` type with all `ARCH §5.1` fields and widening rules |
| Plan complexity | **S → reclassify to M.** See §1.1 |
| New ADR | ADR-0033 — Charter comparison is a partial order |
| Depends on | T1.2 value objects, all unchanged |

---

## 1. Architecture decisions

### 1.1 Scope correction: T1.3 is Medium, not Small

The plan estimated **S** before the `ARCH §5.1` field list was examined against what T1.2 actually delivered.
Four of the eleven Charter fields have no type yet:

| Charter field | Type needed | Exists after T1.2? |
|---|---|---|
| `mission_id` | `MissionId` | ✅ |
| `directive_id` | `DirectiveId` | ❌ **new** |
| `statement`, `rationale` | `String` | ✅ (std) |
| `budget` | `Money` | ✅ |
| `effect_ceiling` | `EffectClass` | ✅ |
| `deadline` | `CalendarDate` | ❌ **new** |
| `autonomy` | `AutonomyDepth` | ❌ **new** |
| `review_intensity` | `ReviewIntensity` | ❌ **new** |
| `fences` | `Fence` | ❌ **new** |
| `departments_allowed` | `DepartmentId` | ❌ **new** |

T1.3 therefore delivers **six new value objects plus the Charter aggregate and its partial order**. That is
Medium.

**Recommendation:** keep it as one task and reclassify. Splitting would put the value objects in one commit
and their only consumer in the next, which makes the first commit unreviewable — nothing exercises the types.

### 1.2 The Charter is immutable and has no widening method

`ARCH` §5.1: the Charter *may only be widened by the Principal*. The weak implementation is
`charter.widen(field, value, actor)` with a runtime actor check. The rule then lives in a function body, one
refactor away from being lost.

**Decision: `Charter` exposes no widening operation at all.**

- `Charter::narrow(&self, amendment)` — always safe, always yields a Charter ⊆ the original. Rejects any
  amendment that would widen or that is incomparable.
- Widening is expressible only by constructing a **new** `Charter` through `Charter::new`, which the command
  layer (E11) gates behind `mission.authorise`.
- `Charter::relation_to(&self, other)` lets that gate be mechanical rather than judgemental.

This is the same technique as ADR-0022: make the boundary a property of what code *can express*, not of what
reviewers remember to check. An agent holding a `&Charter` has no reachable path to a wider one.

**What this satisfies:** the T1.3 acceptance criterion *"Charter cannot be narrowed-then-widened except
through an explicit principal-authored change."* After `narrow`, recovering the original requires
`Charter::new`, and `relation_to` reports `Wider`, which routes to the Principal.

### 1.3 Comparison is a partial order — ADR-0033

Full rationale in ADR-0033. In brief: eleven fields, so an amendment can lower the budget while raising the
effect ceiling. A boolean forces a false answer; a permissiveness score averages a raised ceiling against a
reduced budget — the same error `ARCH` §11.3 already rejects for risk aggregation.

Four values: `Same`, `Narrower`, `Wider`, `Incomparable`. **`Incomparable` is treated as widening.**

### 1.4 `departments_allowed = []` means *universal*, not *empty*

`ARCH` §5.1 is explicit: *empty = any installed department*. Subset comparison must special-case it.
`[] → ["backend"]` is a **narrowing**; `["backend"] → []` is the widest possible widening.

This is the highest-risk line in the task. A diff removing an allowlist entry reads as a restriction to
anyone skimming it, and is the opposite.

### 1.5 `AutonomyDepth` is bounded at 3

ADR-0012 raised autonomous delegation depth from 2 to 3: Kai → Division head → Department head → specialist.
`AutonomyDepth` therefore accepts `0..=3`; 0 means Kai delegates to nobody.

**Assumption flagged:** the corpus states the v2 maximum is 3 but never names a type or an explicit range.
If a Charter should be able to request depth beyond the current architecture's maximum, tell me — but the
architecture as written has no fourth hop to delegate to.

### 1.6 `CalendarDate` is a date, not a timestamp

E1 is dependency-free and stays so until T1.10 (approved). A Charter deadline in `ARCH §5.1` is a calendar
date (`2026-09-15`), not an instant — so no time zone, no clock, no `chrono`.

`CalendarDate` validates a proleptic Gregorian year/month/day with correct leap years, and supports
comparison and ISO-8601 text. Deadline *kinds* (`hard`/`soft`/`derived`), slack and back-propagation are
`ARCH` §10 and belong to E4; T1.3 delivers only the Charter's boundary date.

### 1.7 `Fence` and `DepartmentId` are validated, not `String`

Both are compared for set membership in the partial order. A `String` would make `"no_production_writes"` and
`"no-production-writes"` two distinct fences that a reviewer reads as one, silently weakening a boundary.
Both reuse T1.2's dotted-segment discipline: lowercase ASCII alphanumeric plus one separator.

`Fence` uses underscores per `ARCH` §5.1's literals (`no_production_writes`); `DepartmentId` uses hyphens per
the department slugs elsewhere in the corpus (`backend`, `incident-response`).

---

## 2. Design rationale — why this shape

**Why not a builder.** Eleven fields invites `CharterBuilder`. Rejected: a builder makes a partially-built
Charter representable, and a half-specified boundary is exactly the object that should not exist. `Charter::new`
takes a `CharterSpec` struct — all fields required, named at the call site, validated once.

**Why `CharterAmendment` is sparse.** An amendment names only the fields it changes. `None` means "unchanged",
distinct from `Some(None)` for clearing an optional field. Without that distinction, no amendment could ever
remove a deadline.

**Why `relation_to` is separate from `narrow`.** `narrow` enforces; `relation_to` explains. Delta
authorisation (`ARCH` §14.4) needs to say *what* widened, not merely that something did. Fusing them would
make the approval request say "rejected" where it should say "this raises the effect ceiling from 1 to 2".

**Why no `permits_*` on every field.** Three predicates are included — effect class, budget, department —
because T1.5 (`Task`) needs exactly those to enforce "no Task may exceed the Charter" (`ARCH` §6.3 rule 3).
Adding predicates nothing consumes would be speculative.

---

## 3. Reference implementation

Complete and intended to compile as written. Doc comments are deliberately terser than T1.2's; expand freely.

### 3.1 Additions to `services/mission/src/domain/values.rs`

Append to the existing file. **No existing item is modified.** `validate_opaque` and `validate_dotted` are
already present and private — reuse them.

```rust
// =====================================================================================
// DirectiveId
// =====================================================================================

/// The identity of the Principal's originating Directive, e.g. `dir_01J8KQ4Z9F3B7T2Y6R8N0M5V1C`.
///
/// Opaque and generated, like [`MissionId`]. A Mission's Charter names the Directive it serves,
/// so that any plan traces to the intention that caused it (`ARCH` §5.1).
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct DirectiveId(String);

impl DirectiveId {
    /// The required prefix, including its separator.
    pub const PREFIX: &'static str = "dir_";

    /// Parse and validate a Directive identifier.
    ///
    /// # Errors
    /// Returns [`ValueError`] when the prefix is absent or the body is not 26 Crockford
    /// base32 characters.
    pub fn parse(raw: impl Into<String>) -> Result<Self, ValueError> {
        let raw = raw.into();
        validate_opaque("DirectiveId", Self::PREFIX, &raw)?;
        Ok(Self(raw))
    }

    /// The identifier as a string slice.
    #[must_use]
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for DirectiveId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

impl FromStr for DirectiveId {
    type Err = ValueError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::parse(s)
    }
}

// =====================================================================================
// DepartmentId
// =====================================================================================

/// A department slug, e.g. `backend` or `incident-response`.
///
/// Validated rather than a bare `String` because department identifiers are compared for set
/// membership in the Charter's allowlist; two spellings of one department would silently
/// weaken a boundary.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct DepartmentId(String);

impl DepartmentId {
    /// Parse and validate a department slug: lowercase ASCII alphanumeric and hyphen, no
    /// leading or trailing hyphen.
    ///
    /// # Errors
    /// Returns [`ValueError`] when the input is empty or contains a disallowed character.
    pub fn parse(raw: impl Into<String>) -> Result<Self, ValueError> {
        const KIND: &str = "DepartmentId";
        let raw = raw.into();
        if raw.is_empty() {
            return Err(ValueError::Empty { kind: KIND });
        }
        if raw.starts_with('-') || raw.ends_with('-') {
            return Err(ValueError::Malformed {
                kind: KIND,
                found: raw,
                reason: "may not start or end with a hyphen",
            });
        }
        if !raw
            .bytes()
            .all(|b| b.is_ascii_lowercase() || b.is_ascii_digit() || b == b'-')
        {
            return Err(ValueError::Malformed {
                kind: KIND,
                found: raw,
                reason: "must be lowercase ASCII alphanumeric or hyphen",
            });
        }
        Ok(Self(raw))
    }

    /// The slug as a string slice.
    #[must_use]
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for DepartmentId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

impl FromStr for DepartmentId {
    type Err = ValueError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::parse(s)
    }
}

// =====================================================================================
// Fence
// =====================================================================================

/// A named hard boundary, e.g. `no_production_writes` (`ARCH` §5.1).
///
/// Fences are enumerated, never inferred (Principle 6). More fences is *more* constrained,
/// which is why the Charter's partial order treats a superset of fences as a narrowing.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct Fence(String);

impl Fence {
    /// Parse and validate a fence name: lowercase ASCII alphanumeric and underscore, no
    /// leading or trailing underscore.
    ///
    /// # Errors
    /// Returns [`ValueError`] when the input is empty or contains a disallowed character.
    pub fn parse(raw: impl Into<String>) -> Result<Self, ValueError> {
        const KIND: &str = "Fence";
        let raw = raw.into();
        if raw.is_empty() {
            return Err(ValueError::Empty { kind: KIND });
        }
        if raw.starts_with('_') || raw.ends_with('_') {
            return Err(ValueError::Malformed {
                kind: KIND,
                found: raw,
                reason: "may not start or end with an underscore",
            });
        }
        if !raw
            .bytes()
            .all(|b| b.is_ascii_lowercase() || b.is_ascii_digit() || b == b'_')
        {
            return Err(ValueError::Malformed {
                kind: KIND,
                found: raw,
                reason: "must be lowercase ASCII alphanumeric or underscore",
            });
        }
        Ok(Self(raw))
    }

    /// The fence name as a string slice.
    #[must_use]
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for Fence {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

impl FromStr for Fence {
    type Err = ValueError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::parse(s)
    }
}

// =====================================================================================
// AutonomyDepth
// =====================================================================================

/// Permitted delegation depth, `0..=3`.
///
/// ADR-0012 raised the autonomous delegation depth from 2 to 3:
/// Kai → Division head → Department head → specialist. `0` means Kai delegates to nobody.
/// Higher is *wider*.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct AutonomyDepth(u8);

impl AutonomyDepth {
    /// No delegation.
    pub const NONE: Self = Self(0);
    /// The v2 maximum (ADR-0012).
    pub const MAX: Self = Self(3);

    /// Construct from a depth.
    ///
    /// # Errors
    /// Returns [`ValueError::OutOfRange`] above 3, the deepest chain the v2 org chart defines.
    pub fn new(depth: u8) -> Result<Self, ValueError> {
        if depth > 3 {
            return Err(ValueError::OutOfRange {
                kind: "AutonomyDepth",
                found: format!("{depth}"),
                permitted: "0..=3",
            });
        }
        Ok(Self(depth))
    }

    /// The depth as a number.
    #[must_use]
    pub fn get(self) -> u8 {
        self.0
    }
}

impl fmt::Display for AutonomyDepth {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

// =====================================================================================
// ReviewIntensity
// =====================================================================================

/// How much optional review runs (ADR-0018).
///
/// Ordering is by **permissiveness**, so `Full < Standard < Lean` and the most constrained
/// variant sorts first. No intensity removes the independent reviewer required by ADR-0008,
/// and Security Office reviews are not subject to intensity at all.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum ReviewIntensity {
    /// Every optional gate runs.
    Full,
    /// Office reviews plus stage gates. The default.
    Standard,
    /// Stage gates only; Office reviews where a manifest marks them required.
    Lean,
}

impl Default for ReviewIntensity {
    fn default() -> Self {
        Self::Standard
    }
}

impl fmt::Display for ReviewIntensity {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(match self {
            Self::Full => "full",
            Self::Standard => "standard",
            Self::Lean => "lean",
        })
    }
}

impl FromStr for ReviewIntensity {
    type Err = ValueError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "full" => Ok(Self::Full),
            "standard" => Ok(Self::Standard),
            "lean" => Ok(Self::Lean),
            _ => Err(ValueError::Malformed {
                kind: "ReviewIntensity",
                found: s.to_owned(),
                reason: "expected full, standard or lean",
            }),
        }
    }
}

// =====================================================================================
// CalendarDate
// =====================================================================================

/// A proleptic Gregorian calendar date. No time, no zone, no clock.
///
/// A Charter deadline is a date, not an instant (`ARCH` §5.1). Field order is
/// year-month-day so that derived `Ord` gives chronological ordering.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct CalendarDate {
    year: u16,
    month: u8,
    day: u8,
}

impl CalendarDate {
    /// Construct a date.
    ///
    /// # Errors
    /// Returns [`ValueError::OutOfRange`] for a year outside `1..=9999`, a month outside
    /// `1..=12`, or a day outside the month's length in that year.
    pub fn new(year: u16, month: u8, day: u8) -> Result<Self, ValueError> {
        if !(1..=9999).contains(&year) {
            return Err(ValueError::OutOfRange {
                kind: "CalendarDate year",
                found: format!("{year}"),
                permitted: "1..=9999",
            });
        }
        if !(1..=12).contains(&month) {
            return Err(ValueError::OutOfRange {
                kind: "CalendarDate month",
                found: format!("{month}"),
                permitted: "1..=12",
            });
        }
        let limit = Self::days_in_month(year, month);
        if day < 1 || day > limit {
            return Err(ValueError::OutOfRange {
                kind: "CalendarDate day",
                found: format!("{day}"),
                permitted: "1..=days in month",
            });
        }
        Ok(Self { year, month, day })
    }

    /// Whether `year` is a leap year in the proleptic Gregorian calendar.
    #[must_use]
    pub fn is_leap_year(year: u16) -> bool {
        (year % 4 == 0 && year % 100 != 0) || year % 400 == 0
    }

    /// The number of days in `month` of `year`. Returns 0 for an invalid month.
    #[must_use]
    pub fn days_in_month(year: u16, month: u8) -> u8 {
        match month {
            1 | 3 | 5 | 7 | 8 | 10 | 12 => 31,
            4 | 6 | 9 | 11 => 30,
            2 if Self::is_leap_year(year) => 29,
            2 => 28,
            _ => 0,
        }
    }

    /// The year.
    #[must_use]
    pub fn year(self) -> u16 {
        self.year
    }

    /// The month, `1..=12`.
    #[must_use]
    pub fn month(self) -> u8 {
        self.month
    }

    /// The day of month.
    #[must_use]
    pub fn day(self) -> u8 {
        self.day
    }

    /// Parse an ISO-8601 calendar date, `YYYY-MM-DD`.
    ///
    /// # Errors
    /// Returns [`ValueError`] when the shape is wrong or the date does not exist.
    pub fn parse(raw: &str) -> Result<Self, ValueError> {
        const KIND: &str = "CalendarDate";
        let malformed = || ValueError::Malformed {
            kind: KIND,
            found: raw.to_owned(),
            reason: "expected YYYY-MM-DD",
        };
        let bytes = raw.as_bytes();
        if bytes.len() != 10 || bytes[4] != b'-' || bytes[7] != b'-' {
            return Err(malformed());
        }
        if !bytes
            .iter()
            .enumerate()
            .all(|(i, b)| i == 4 || i == 7 || b.is_ascii_digit())
        {
            return Err(malformed());
        }
        let year: u16 = raw[0..4].parse().map_err(|_| malformed())?;
        let month: u8 = raw[5..7].parse().map_err(|_| malformed())?;
        let day: u8 = raw[8..10].parse().map_err(|_| malformed())?;
        Self::new(year, month, day)
    }
}

impl fmt::Display for CalendarDate {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:04}-{:02}-{:02}", self.year, self.month, self.day)
    }
}

impl FromStr for CalendarDate {
    type Err = ValueError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::parse(s)
    }
}
```

### 3.2 New file — `services/mission/src/domain/charter.rs`

```rust
//! The Mission Charter — the constraint envelope every plan must fit inside.
//!
//! `ARCH` §5.1: *The Charter is the outer boundary. Every Objective, Task, and Dispatch is a
//! subset of it.* It is v1's Mandate, preserved field-for-field and extended.
//!
//! # Widening
//!
//! A Charter *may only be widened by the Principal*. This module makes that structural rather
//! than procedural: **there is no widening operation.** [`Charter::narrow`] can only produce a
//! Charter contained by its receiver. Widening requires constructing a new [`Charter`], which
//! the command layer gates behind Principal authorisation.
//!
//! [`Charter::relation_to`] exists so that gate can be mechanical. See ADR-0033.
//!
//! Milestone M15, Epic E1, Task T1.3.

use core::fmt;
use std::collections::BTreeSet;

use crate::domain::values::{
    AutonomyDepth, CalendarDate, DepartmentId, DirectiveId, EffectClass, Fence, MissionId, Money,
    ReviewIntensity,
};

// =====================================================================================
// Errors
// =====================================================================================

/// Why a Charter operation failed.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum CharterError {
    /// A required free-text field was blank.
    BlankField {
        /// Which field.
        field: &'static str,
    },
    /// An amendment would widen the Charter. Only the Principal may widen, by authorising a
    /// new Charter (`ARCH` §5.1).
    WouldWiden {
        /// The field that widened, or `"multiple"`.
        field: &'static str,
    },
    /// An amendment changed a field that has no ordering, so containment is undecidable.
    /// Treated exactly as widening (ADR-0033).
    Incomparable {
        /// Which field.
        field: &'static str,
    },
}

impl fmt::Display for CharterError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::BlankField { field } => write!(f, "charter field `{field}` may not be blank"),
            Self::WouldWiden { field } => write!(
                f,
                "amending `{field}` would widen the charter; only the Principal may widen"
            ),
            Self::Incomparable { field } => write!(
                f,
                "amending `{field}` produces a charter that is neither narrower nor wider; \
                 it requires Principal authorisation"
            ),
        }
    }
}

impl std::error::Error for CharterError {}

// =====================================================================================
// Relation
// =====================================================================================

/// How one Charter relates to another. A partial order — see ADR-0033.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum CharterRelation {
    /// Identical in every field.
    Same,
    /// Contained by the other: no field grants more, at least one grants less.
    Narrower,
    /// Contains the other: no field grants less, at least one grants more.
    Wider,
    /// Neither contains the other. **Treated as widening at every authorisation site.**
    Incomparable,
}

impl CharterRelation {
    /// Whether this relation requires Principal authorisation.
    ///
    /// `Wider` and `Incomparable` both do. Failing closed is the point: an unanticipated
    /// combination asks rather than proceeds.
    #[must_use]
    pub fn requires_principal(self) -> bool {
        matches!(self, Self::Wider | Self::Incomparable)
    }
}

/// Per-field relation, folded into a [`CharterRelation`].
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum FieldRelation {
    Same,
    Narrower,
    Wider,
    Incomparable,
}

fn fold(relations: &[FieldRelation]) -> CharterRelation {
    let mut narrower = false;
    let mut wider = false;
    for relation in relations {
        match relation {
            FieldRelation::Same => {}
            FieldRelation::Narrower => narrower = true,
            FieldRelation::Wider => wider = true,
            FieldRelation::Incomparable => return CharterRelation::Incomparable,
        }
    }
    match (narrower, wider) {
        (false, false) => CharterRelation::Same,
        (true, false) => CharterRelation::Narrower,
        (false, true) => CharterRelation::Wider,
        (true, true) => CharterRelation::Incomparable,
    }
}

/// Compare two totally-ordered values where **greater means wider**.
fn compare_wider_is_greater<T: Ord>(mine: &T, theirs: &T) -> FieldRelation {
    match mine.cmp(theirs) {
        core::cmp::Ordering::Equal => FieldRelation::Same,
        core::cmp::Ordering::Less => FieldRelation::Narrower,
        core::cmp::Ordering::Greater => FieldRelation::Wider,
    }
}

/// Compare optional deadlines. `None` means no deadline, which is the widest.
fn compare_deadline(mine: Option<CalendarDate>, theirs: Option<CalendarDate>) -> FieldRelation {
    match (mine, theirs) {
        (None, None) => FieldRelation::Same,
        (None, Some(_)) => FieldRelation::Wider,
        (Some(_), None) => FieldRelation::Narrower,
        (Some(a), Some(b)) => compare_wider_is_greater(&a, &b),
    }
}

/// Compare fence sets. **More fences is narrower**, so a superset is a narrowing.
fn compare_fences(mine: &BTreeSet<Fence>, theirs: &BTreeSet<Fence>) -> FieldRelation {
    let mine_has_extra = mine.difference(theirs).next().is_some();
    let theirs_has_extra = theirs.difference(mine).next().is_some();
    match (mine_has_extra, theirs_has_extra) {
        (false, false) => FieldRelation::Same,
        (true, false) => FieldRelation::Narrower,
        (false, true) => FieldRelation::Wider,
        (true, true) => FieldRelation::Incomparable,
    }
}

/// Compare department allowlists.
///
/// **An empty set denotes the universal set** — `ARCH` §5.1: *empty = any installed
/// department*. So `[] → ["backend"]` is a narrowing and `["backend"] → []` is a widening.
/// Naive subset comparison inverts both.
fn compare_departments(
    mine: &BTreeSet<DepartmentId>,
    theirs: &BTreeSet<DepartmentId>,
) -> FieldRelation {
    match (mine.is_empty(), theirs.is_empty()) {
        (true, true) => FieldRelation::Same,
        (true, false) => FieldRelation::Wider,
        (false, true) => FieldRelation::Narrower,
        (false, false) => {
            let mine_has_extra = mine.difference(theirs).next().is_some();
            let theirs_has_extra = theirs.difference(mine).next().is_some();
            match (mine_has_extra, theirs_has_extra) {
                (false, false) => FieldRelation::Same,
                (true, false) => FieldRelation::Wider,
                (false, true) => FieldRelation::Narrower,
                (true, true) => FieldRelation::Incomparable,
            }
        }
    }
}

fn compare_identity<T: PartialEq>(mine: &T, theirs: &T) -> FieldRelation {
    if mine == theirs {
        FieldRelation::Same
    } else {
        FieldRelation::Incomparable
    }
}

// =====================================================================================
// Charter
// =====================================================================================

/// The fields required to construct a [`Charter`].
///
/// A struct rather than a builder: a builder makes a partially-built Charter representable,
/// and a half-specified boundary is precisely the object that must not exist.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CharterSpec {
    /// The Mission this Charter bounds.
    pub mission_id: MissionId,
    /// The Principal's originating Directive.
    pub directive_id: DirectiveId,
    /// What the Mission is for, in the Principal's terms.
    pub statement: String,
    /// Why it is worth doing.
    pub rationale: String,
    /// The Mission budget ceiling — the fifth nested budget scope (`ARCH` §16.3).
    pub budget: Money,
    /// No Task may exceed this effect class.
    pub effect_ceiling: EffectClass,
    /// Optional deadline. `None` is the widest.
    pub deadline: Option<CalendarDate>,
    /// Permitted delegation depth.
    pub autonomy: AutonomyDepth,
    /// How much optional review runs (ADR-0018).
    pub review_intensity: ReviewIntensity,
    /// Hard boundaries. More fences is more constrained.
    pub fences: BTreeSet<Fence>,
    /// Department allowlist. **Empty means any installed department**, not none.
    pub departments_allowed: BTreeSet<DepartmentId>,
}

/// A sparse amendment. `None` means "leave unchanged".
///
/// `deadline` is doubly optional: `None` leaves it alone, `Some(None)` removes it — which is a
/// widening, and therefore rejected by [`Charter::narrow`].
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct CharterAmendment {
    /// Replace the budget.
    pub budget: Option<Money>,
    /// Replace the effect ceiling.
    pub effect_ceiling: Option<EffectClass>,
    /// Replace or remove the deadline.
    pub deadline: Option<Option<CalendarDate>>,
    /// Replace the autonomy depth.
    pub autonomy: Option<AutonomyDepth>,
    /// Replace the review intensity.
    pub review_intensity: Option<ReviewIntensity>,
    /// Replace the fence set entirely.
    pub fences: Option<BTreeSet<Fence>>,
    /// Replace the department allowlist entirely.
    pub departments_allowed: Option<BTreeSet<DepartmentId>>,
}

/// The constraint envelope of a Mission.
///
/// Immutable. Every Objective, Task and Dispatch must fit inside it (`ARCH` §5.1). There is no
/// widening operation — see the module documentation and ADR-0033.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Charter {
    mission_id: MissionId,
    directive_id: DirectiveId,
    statement: String,
    rationale: String,
    budget: Money,
    effect_ceiling: EffectClass,
    deadline: Option<CalendarDate>,
    autonomy: AutonomyDepth,
    review_intensity: ReviewIntensity,
    fences: BTreeSet<Fence>,
    departments_allowed: BTreeSet<DepartmentId>,
}

impl Charter {
    /// Construct a Charter.
    ///
    /// This is the only way to obtain a Charter that is not contained by an existing one, and
    /// therefore the operation the command layer gates behind Principal authorisation.
    ///
    /// # Errors
    /// Returns [`CharterError::BlankField`] when `statement` or `rationale` is blank.
    pub fn new(spec: CharterSpec) -> Result<Self, CharterError> {
        if spec.statement.trim().is_empty() {
            return Err(CharterError::BlankField { field: "statement" });
        }
        if spec.rationale.trim().is_empty() {
            return Err(CharterError::BlankField { field: "rationale" });
        }
        Ok(Self {
            mission_id: spec.mission_id,
            directive_id: spec.directive_id,
            statement: spec.statement,
            rationale: spec.rationale,
            budget: spec.budget,
            effect_ceiling: spec.effect_ceiling,
            deadline: spec.deadline,
            autonomy: spec.autonomy,
            review_intensity: spec.review_intensity,
            fences: spec.fences,
            departments_allowed: spec.departments_allowed,
        })
    }

    /// Apply an amendment that does not widen.
    ///
    /// # Errors
    /// Returns [`CharterError::WouldWiden`] or [`CharterError::Incomparable`] if the result
    /// would not be contained by `self`. In either case the caller must route the change to
    /// the Principal as a new Charter.
    pub fn narrow(&self, amendment: &CharterAmendment) -> Result<Self, CharterError> {
        let candidate = self.with_amendment(amendment);
        match candidate.relation_to(self) {
            CharterRelation::Same | CharterRelation::Narrower => Ok(candidate),
            CharterRelation::Wider => Err(CharterError::WouldWiden {
                field: Self::first_widened_field(&candidate, self),
            }),
            CharterRelation::Incomparable => Err(CharterError::Incomparable {
                field: Self::first_widened_field(&candidate, self),
            }),
        }
    }

    /// How `self` relates to `other`. See ADR-0033.
    #[must_use]
    pub fn relation_to(&self, other: &Self) -> CharterRelation {
        fold(&self.field_relations(other))
    }

    fn field_relations(&self, other: &Self) -> [FieldRelation; 11] {
        [
            compare_identity(&self.mission_id, &other.mission_id),
            compare_identity(&self.directive_id, &other.directive_id),
            compare_identity(&self.statement, &other.statement),
            compare_identity(&self.rationale, &other.rationale),
            compare_wider_is_greater(&self.budget, &other.budget),
            compare_wider_is_greater(&self.effect_ceiling, &other.effect_ceiling),
            compare_deadline(self.deadline, other.deadline),
            compare_wider_is_greater(&self.autonomy, &other.autonomy),
            // ReviewIntensity's derived Ord is Full < Standard < Lean, i.e. greater is wider.
            compare_wider_is_greater(&self.review_intensity, &other.review_intensity),
            compare_fences(&self.fences, &other.fences),
            compare_departments(&self.departments_allowed, &other.departments_allowed),
        ]
    }

    /// Names of the eleven fields, in the order [`Self::field_relations`] returns them.
    const FIELD_NAMES: [&'static str; 11] = [
        "mission_id",
        "directive_id",
        "statement",
        "rationale",
        "budget",
        "effect_ceiling",
        "deadline",
        "autonomy",
        "review_intensity",
        "fences",
        "departments_allowed",
    ];

    fn first_widened_field(candidate: &Self, base: &Self) -> &'static str {
        candidate
            .field_relations(base)
            .iter()
            .position(|r| matches!(r, FieldRelation::Wider | FieldRelation::Incomparable))
            .map_or("multiple", |i| Self::FIELD_NAMES[i])
    }

    fn with_amendment(&self, amendment: &CharterAmendment) -> Self {
        Self {
            mission_id: self.mission_id.clone(),
            directive_id: self.directive_id.clone(),
            statement: self.statement.clone(),
            rationale: self.rationale.clone(),
            budget: amendment.budget.unwrap_or(self.budget),
            effect_ceiling: amendment.effect_ceiling.unwrap_or(self.effect_ceiling),
            deadline: amendment.deadline.unwrap_or(self.deadline),
            autonomy: amendment.autonomy.unwrap_or(self.autonomy),
            review_intensity: amendment.review_intensity.unwrap_or(self.review_intensity),
            fences: amendment.fences.clone().unwrap_or_else(|| self.fences.clone()),
            departments_allowed: amendment
                .departments_allowed
                .clone()
                .unwrap_or_else(|| self.departments_allowed.clone()),
        }
    }

    // --- boundary predicates, consumed by T1.5 -----------------------------------------

    /// Whether an effect class is within the ceiling.
    #[must_use]
    pub fn permits_effect_class(&self, class: EffectClass) -> bool {
        class <= self.effect_ceiling
    }

    /// Whether an amount is within the budget.
    #[must_use]
    pub fn permits_budget(&self, amount: Money) -> bool {
        amount <= self.budget
    }

    /// Whether a department may be used. An empty allowlist permits any department.
    #[must_use]
    pub fn permits_department(&self, department: &DepartmentId) -> bool {
        self.departments_allowed.is_empty() || self.departments_allowed.contains(department)
    }

    // --- accessors ----------------------------------------------------------------------

    /// The Mission this Charter bounds.
    #[must_use]
    pub fn mission_id(&self) -> &MissionId {
        &self.mission_id
    }
    /// The originating Directive.
    #[must_use]
    pub fn directive_id(&self) -> &DirectiveId {
        &self.directive_id
    }
    /// What the Mission is for.
    #[must_use]
    pub fn statement(&self) -> &str {
        &self.statement
    }
    /// Why it is worth doing.
    #[must_use]
    pub fn rationale(&self) -> &str {
        &self.rationale
    }
    /// The budget ceiling.
    #[must_use]
    pub fn budget(&self) -> Money {
        self.budget
    }
    /// The effect ceiling.
    #[must_use]
    pub fn effect_ceiling(&self) -> EffectClass {
        self.effect_ceiling
    }
    /// The deadline, if any.
    #[must_use]
    pub fn deadline(&self) -> Option<CalendarDate> {
        self.deadline
    }
    /// The permitted delegation depth.
    #[must_use]
    pub fn autonomy(&self) -> AutonomyDepth {
        self.autonomy
    }
    /// The review intensity.
    #[must_use]
    pub fn review_intensity(&self) -> ReviewIntensity {
        self.review_intensity
    }
    /// The fence set.
    #[must_use]
    pub fn fences(&self) -> &BTreeSet<Fence> {
        &self.fences
    }
    /// The department allowlist. Empty means any installed department.
    #[must_use]
    pub fn departments_allowed(&self) -> &BTreeSet<DepartmentId> {
        &self.departments_allowed
    }
}
```

### 3.3 Module wiring — `services/mission/src/domain/mod.rs`

Add one line after the existing `pub mod values;`:

```rust
pub mod charter;
```

---

## 4. File manifest

| Path | Status | Contents |
|---|---|---|
| `services/mission/src/domain/values.rs` | **Modified — append only** | `DirectiveId`, `DepartmentId`, `Fence`, `AutonomyDepth`, `ReviewIntensity`, `CalendarDate` |
| `services/mission/src/domain/charter.rs` | **New** | `Charter`, `CharterSpec`, `CharterAmendment`, `CharterRelation`, `CharterError` |
| `services/mission/src/domain/mod.rs` | **Modified — one line** | `pub mod charter;` |
| `services/mission/tests/charter.rs` | **New** | Charter tests — see §5 |
| `services/mission/tests/values.rs` | **Modified — append only** | Tests for the six new value objects |
| `docs-v2/adr/0033-charter-comparison-is-a-partial-order.md` | **New** | Delivered as `ADR-0033-charter-partial-order.md` |

**No existing item in `values.rs` is modified.** If integration requires changing one, stop and report it.

The `values.rs` file-length justification header already anticipates this: it directs splitting by kind
(identifiers / quantities / enumerations) rather than per type once the aggregates land. **Do not split it in
T1.3** — do it as a mechanical commit when it next becomes uncomfortable, so the split diff contains nothing
but moves.

---

## 5. Acceptance criteria

### 5.1 From the implementation plan

> Charter cannot be narrowed-then-widened except through an explicit principal-authored change; unit tests

| # | Criterion | Test |
|---|---|---|
| a | `Charter` carries all eleven `ARCH §5.1` fields | Construct from the architecture's own example values |
| b | `narrow` accepts every narrowing amendment | One per orderable field: lower budget, lower ceiling, earlier deadline, lower autonomy, `Lean → Standard → Full`, added fence, `[] → ["backend"]` |
| c | `narrow` rejects every widening amendment | The inverse of each above; each returns `WouldWiden` naming the field |
| d | `narrow` rejects mixed amendments as `Incomparable` | Lower budget + raised ceiling in one amendment |
| e | **Narrow-then-widen is impossible** | `c.narrow(down)` then attempt to recover: every route returns `Err`; only `Charter::new` produces it, and `relation_to` reports `Wider` |
| f | `relation_to` is reflexive and antisymmetric | `c.relation_to(&c) == Same`; if `a→b` is `Narrower` then `b→a` is `Wider`, over a generated sample |
| g | Identity fields are `Incomparable` when unequal | Changing `statement` alone |

### 5.2 Additional, from this design

| # | Criterion | Test |
|---|---|---|
| h | **Empty allowlist means universal** | `[] → ["backend"]` is `Narrower`; `["backend"] → []` is `Wider`; `permits_department` returns `true` for any department when empty |
| i | Disjoint allowlists are `Incomparable` | `["backend"]` vs `["design"]` |
| j | Disjoint fence sets are `Incomparable` | Same shape |
| k | `Incomparable.requires_principal()` is `true` | Direct assertion — the fail-closed rule |
| l | `CalendarDate` rejects impossible dates | `2026-02-29`, `2024-02-30`, `2026-13-01`, `2026-00-10`, `2026-04-31`; accepts `2024-02-29` |
| m | `CalendarDate` round-trips ISO-8601 | Property test over the LCG, 5,000 samples |
| n | `AutonomyDepth` accepts exactly `0..=3` | Property test over all 256 `u8` values |
| o | `ReviewIntensity` orders `Full < Standard < Lean` | Direct assertion, plus `FromStr`/`Display` round-trip |
| p | `Fence` and `DepartmentId` reject their separator at either end and reject the other's separator | Rejection tables |
| q | Blank `statement` or `rationale` is rejected | Including whitespace-only |

**Expected suite after T1.3:** 43 existing + roughly 45 new ≈ **88 tests**. Report the actual number.

### 5.3 Invariants — do not resolve away

Additions to the §10 list in the T1.1/T1.2 package. Same rule: if a fix seems to require changing one, stop
and report.

| Invariant | Why |
|---|---|
| `Charter` has **no widening method** | The Principal-only rule is structural, not procedural (§1.2) |
| `Incomparable` is treated as widening | Fail closed (ADR-0033) |
| Empty `departments_allowed` means **universal** | `ARCH` §5.1; naive subset logic inverts it (§1.4) |
| More fences is **narrower** | Fences constrain; a superset is a tighter boundary |
| `ReviewIntensity` ordering is `Full < Standard < Lean` | Ordering is by permissiveness, not alphabet (ADR-0018) |
| Still **zero dependencies** | Approved; serde at T1.10 |
| Property tests still use the seeded LCG | Approved; no `proptest` during E1 |

---

## 6. Integration notes for AntiGravity

1. **Append to `values.rs`; do not reorder it.** The six new types go at the end. Reordering would make the
   diff unreadable against the T1.2 baseline.
2. **`BTreeSet`, not `HashSet`.** Deterministic iteration order, and `Ord` on the element types is already
   derived. Determinism matters here because these sets will be serialised at T1.10 and hashed into the event
   chain; `HashSet` ordering would make the same Charter produce different bytes across runs.
3. **`ReviewIntensity`'s derived `Ord` is load-bearing.** Variant declaration order is `Full`, `Standard`,
   `Lean`, which yields `Full < Standard < Lean`. Do not reorder the variants to satisfy a lint.
4. **`Charter::FIELD_NAMES` must stay index-aligned with `field_relations`.** They are parallel arrays. If a
   field is added, both change together, or error messages will name the wrong field. A better encoding
   exists; it is deferred to §7 rather than solved here.
5. **Anticipated compile issues**, ranked:
   - `compare_wider_is_greater` on `EffectClass` requires `Ord`, which T1.2 derived. Confirm it survived
     integration.
   - `amendment.deadline.unwrap_or(self.deadline)` operates on `Option<Option<CalendarDate>>` — the outer
     `unwrap_or` yields `Option<CalendarDate>`. This is correct but reads oddly; leave it.
   - `Charter::new` takes `CharterSpec` by value and moves out of it field by field — fine, `spec` is not
     used afterwards.
   - Clippy may suggest `#[derive(Default)]` on `ReviewIntensity` instead of the manual `impl`. Either is
     fine; the manual impl documents that `Standard` is ADR-0018's default rather than the first variant.
6. **Do not create the ADR file from the design document.** `ADR-0033-charter-partial-order.md` is delivered
   separately; file it at `docs-v2/adr/0033-charter-comparison-is-a-partial-order.md` and add it to the ADR
   index at `docs-v2/adr/README.md`.
7. **Report back:** build, test count, clippy, MSRV (still unanswered from the last package), and anything in
   §5.3 you had to touch.

---

## 7. Assumptions, limitations, follow-up

**Assumptions requiring confirmation:**

1. **`AutonomyDepth` maximum is 3.** Derived from ADR-0012's delegation chain. The corpus never states a
   range explicitly. If a Charter may request a depth the org chart cannot serve, this is wrong.
2. **`Fence` uses underscores, `DepartmentId` uses hyphens.** Taken from the literals in `ARCH` §5.1 and the
   department slugs elsewhere. It is an inconsistency in the corpus, not in this design; I preserved it
   rather than unifying, because unifying would silently invalidate existing document examples.
3. **Amendments replace collections wholesale**, rather than offering add/remove deltas. Simpler, and the
   partial order makes the effect explicit either way. Revisit if E10's replanning wants finer granularity.

**Not verified:** nothing in §3 was compiled. No toolchain available. Treat all reference code as unverified
until AntiGravity builds it.

**Follow-up scheduled, not now:**

| Ref | Item | When |
|---|---|---|
| — | Replace the parallel `FIELD_NAMES` / `field_relations` arrays with a single table of `(name, comparator)` | When a twelfth field is added |
| — | `Weight` summation tolerance — floats will not sum to exactly 1.0 for thirds | **T1.4**, where objective weights are first summed. Decide epsilon, or migrate `Weight` to fixed-point basis points |
| — | `MissionId`/`DirectiveId` generation | E2, where a clock and randomness exist |
| — | `Duration` shadowing `core::time::Duration` | T1.10, when serde forces the two into one scope |
| AI-003 | Implementation-plan edits recording `ContractRef`/`ArtifactRef` → T1.5, `PlanVersion` → T1.7 | Still unowned |
| AI-001 | Lyra/Corvus department-head contradiction | Before M16 |

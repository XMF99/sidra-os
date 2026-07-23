// FILE LENGTH: exceeds the 400-line guidance in /MASTER_IMPLEMENTATION_GUIDE.md §6.
// Justification: this file is a single cohesive concept — the domain's value objects — and
// roughly 60% of it is documentation. Splitting it per type would produce nine files that are
// never read independently, and would diverge from the file named by task T1.2. If it grows
// past the aggregates in T1.3-T1.8, split it by kind (identifiers / quantities / enumerations)
// rather than per type.

//! Value objects of the Mission Engine domain.
//!
//! Every type here rejects invalid construction. There is no way to hold a `Weight` outside
//! `[0, 1]`, an `EffectClass` above 3, or a negative `Money`. Validation lives at the boundary
//! so that nothing downstream re-checks it.
//!
//! Formats are taken verbatim from `/MISSION_ENGINE_ARCHITECTURE.md`:
//!
//! | Type | Canonical form | Architecture reference |
//! |---|---|---|
//! | [`MissionId`] | `msn_01J8KQ4Z9F3B7T2Y6R8N0M5V1C` | §5.1 |
//! | [`ObjectiveId`] | `obj.failover` | §5.2 |
//! | [`TaskId`] | `tsk.failover.runbook` | §6.1 |
//! | [`IdempotencyKey`] | `tsk.failover.runbook@v1` | §6.1 |
//! | [`Money`] | `$45.00` | §5.1 |
//! | [`Duration`] | `18m` | §6.1 |
//! | [`EffectClass`] | `0`–`3` | §5.1 |
//! | [`PriorityTier`] | `P0`–`P3` | §9.2 |
//!
//! # Identifiers validate; they do not generate
//!
//! [`MissionId`] parses and checks. It has no constructor that mints a new identifier, because
//! minting one needs a clock and a random source, and this module has neither by design.
//! Generation belongs to the layer that owns those (E2).
//!
//! Milestone M15, Epic E1, Task T1.2.

use core::fmt;
use core::str::FromStr;
use serde::{Deserialize, Serialize};

// =====================================================================================
// Errors
// =====================================================================================

/// Why a value object could not be constructed.
///
/// One error type for the module. Each variant names the offending input so a caller can
/// report it without re-deriving what went wrong.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ValueError {
    /// The input was empty where a value was required.
    Empty {
        /// The value object being constructed.
        kind: &'static str,
    },
    /// The input did not begin with the required prefix.
    WrongPrefix {
        /// The value object being constructed.
        kind: &'static str,
        /// The prefix the input was required to start with, including its separator.
        expected: &'static str,
        /// The input as supplied.
        found: String,
    },
    /// The input was structurally malformed for its kind.
    Malformed {
        /// The value object being constructed.
        kind: &'static str,
        /// The input as supplied.
        found: String,
        /// Why it was rejected, phrased so it can be shown to a person.
        reason: &'static str,
    },
    /// A numeric input fell outside the range its type permits.
    OutOfRange {
        /// The value object being constructed.
        kind: &'static str,
        /// The offending value, rendered.
        found: String,
        /// The permitted range, rendered.
        permitted: &'static str,
    },
}

impl fmt::Display for ValueError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ValueError::Empty { kind } => {
                write!(f, "{kind} cannot be empty")
            }
            ValueError::WrongPrefix {
                kind,
                expected,
                found,
            } => write!(f, "{kind} must start with `{expected}`, got `{found}`"),
            ValueError::Malformed {
                kind,
                found,
                reason,
            } => write!(f, "invalid {kind} `{found}`: {reason}"),
            ValueError::OutOfRange {
                kind,
                found,
                permitted,
            } => write!(
                f,
                "{kind} value {found} is outside the permitted range {permitted}"
            ),
        }
    }
}

impl std::error::Error for ValueError {}

// =====================================================================================
// Identifier helpers
// =====================================================================================

/// Crockford base32, the ULID alphabet. Excludes `I`, `L`, `O` and `U` so that identifiers
/// survive being read aloud or transcribed by hand.
const CROCKFORD: &[u8] = b"0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/// The number of body characters in an opaque identifier, after its prefix.
const OPAQUE_BODY_LEN: usize = 26;

/// Validate an opaque `<prefix>_<26 Crockford base32 chars>` identifier.
fn validate_opaque(kind: &'static str, prefix: &'static str, raw: &str) -> Result<(), ValueError> {
    if raw.is_empty() {
        return Err(ValueError::Empty { kind });
    }
    let body = raw
        .strip_prefix(prefix)
        .ok_or_else(|| ValueError::WrongPrefix {
            kind,
            expected: prefix,
            found: raw.to_owned(),
        })?;
    if body.len() != OPAQUE_BODY_LEN {
        return Err(ValueError::Malformed {
            kind,
            found: raw.to_owned(),
            reason: "body must be exactly 26 characters",
        });
    }
    if !body.bytes().all(|b| CROCKFORD.contains(&b)) {
        return Err(ValueError::Malformed {
            kind,
            found: raw.to_owned(),
            reason: "body must be uppercase Crockford base32 (no I, L, O or U)",
        });
    }
    Ok(())
}

/// Validate a dotted semantic identifier such as `tsk.failover.runbook`.
///
/// Rules: the declared prefix, then one or more segments separated by single dots. A segment is
/// lowercase ASCII alphanumeric or hyphen, non-empty, and may neither start nor end with a
/// hyphen. These identifiers are authored by hand and read constantly, so they are constrained
/// tightly enough to stay legible.
fn validate_dotted(kind: &'static str, prefix: &'static str, raw: &str) -> Result<(), ValueError> {
    if raw.is_empty() {
        return Err(ValueError::Empty { kind });
    }
    let rest = raw
        .strip_prefix(prefix)
        .ok_or_else(|| ValueError::WrongPrefix {
            kind,
            expected: prefix,
            found: raw.to_owned(),
        })?;
    if rest.is_empty() {
        return Err(ValueError::Malformed {
            kind,
            found: raw.to_owned(),
            reason: "at least one segment is required after the prefix",
        });
    }
    for segment in rest.split('.') {
        if segment.is_empty() {
            return Err(ValueError::Malformed {
                kind,
                found: raw.to_owned(),
                reason: "segments may not be empty",
            });
        }
        if segment.starts_with('-') || segment.ends_with('-') {
            return Err(ValueError::Malformed {
                kind,
                found: raw.to_owned(),
                reason: "segments may not start or end with a hyphen",
            });
        }
        if !segment
            .bytes()
            .all(|b| b.is_ascii_lowercase() || b.is_ascii_digit() || b == b'-')
        {
            return Err(ValueError::Malformed {
                kind,
                found: raw.to_owned(),
                reason: "segments must be lowercase ASCII alphanumeric or hyphen",
            });
        }
    }
    Ok(())
}

// =====================================================================================
// MissionId
// =====================================================================================

/// The identity of a Mission, for example `msn_01J8KQ4Z9F3B7T2Y6R8N0M5V1C`.
///
/// Opaque and generated, unlike [`TaskId`] and [`ObjectiveId`], which are authored. A Mission
/// is created by the system; a Task is named by a planner, and the difference in form is a
/// deliberate signal about which is which.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct MissionId(String);

impl MissionId {
    /// The required prefix, including its separator.
    pub const PREFIX: &'static str = "msn_";

    /// Parse and validate a Mission identifier.
    ///
    /// # Errors
    ///
    /// Returns [`ValueError`] when the prefix is absent or the body is not 26 Crockford
    /// base32 characters.
    pub fn parse(raw: impl Into<String>) -> Result<Self, ValueError> {
        let raw = raw.into();
        validate_opaque("MissionId", Self::PREFIX, &raw)?;
        Ok(Self(raw))
    }

    /// The identifier as a string slice.
    #[must_use]
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for MissionId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

impl FromStr for MissionId {
    type Err = ValueError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::parse(s)
    }
}

// =====================================================================================
// ObjectiveId
// =====================================================================================

/// The identity of an Objective within a Mission, for example `obj.failover`.
///
/// Authored, not generated. Unique within its Mission, not globally.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct ObjectiveId(String);

impl ObjectiveId {
    /// The required prefix, including its separator.
    pub const PREFIX: &'static str = "obj.";

    /// Parse and validate an Objective identifier.
    ///
    /// # Errors
    ///
    /// Returns [`ValueError`] when the prefix is absent or a segment is malformed.
    pub fn parse(raw: impl Into<String>) -> Result<Self, ValueError> {
        let raw = raw.into();
        validate_dotted("ObjectiveId", Self::PREFIX, &raw)?;
        Ok(Self(raw))
    }

    /// The identifier as a string slice.
    #[must_use]
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for ObjectiveId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

impl FromStr for ObjectiveId {
    type Err = ValueError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::parse(s)
    }
}

// =====================================================================================
// TaskId
// =====================================================================================

/// The identity of a Task within a Mission, for example `tsk.failover.runbook`.
///
/// Authored, not generated. Unique within its Mission, not globally.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct TaskId(String);

impl TaskId {
    /// The required prefix, including its separator.
    pub const PREFIX: &'static str = "tsk.";

    /// Parse and validate a Task identifier.
    ///
    /// # Errors
    ///
    /// Returns [`ValueError`] when the prefix is absent or a segment is malformed.
    pub fn parse(raw: impl Into<String>) -> Result<Self, ValueError> {
        let raw = raw.into();
        validate_dotted("TaskId", Self::PREFIX, &raw)?;
        Ok(Self(raw))
    }

    /// The identifier as a string slice.
    #[must_use]
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for TaskId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

impl FromStr for TaskId {
    type Err = ValueError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::parse(s)
    }
}

// =====================================================================================
// IdempotencyKey
// =====================================================================================

/// A Task's idempotency key, for example `tsk.failover.runbook@v1`.
///
/// Mandatory for any Task whose retry policy permits retries at effect class 1 or above
/// (`ARCH` §6.3 rule 4). Its absence makes a Task ineligible for retry regardless of policy,
/// which is why the type exists rather than a bare string: an unparseable key is a Task that
/// must not be retried, and that should be visible at construction.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct IdempotencyKey {
    task: TaskId,
    version: u32,
}

impl IdempotencyKey {
    /// Build a key from a Task identifier and a plan version.
    #[must_use]
    pub fn new(task: TaskId, version: u32) -> Self {
        Self { task, version }
    }

    /// Parse the canonical `<task-id>@v<version>` form.
    ///
    /// # Errors
    ///
    /// Returns [`ValueError`] when the separator is missing, the version marker is absent, or
    /// either half is malformed.
    pub fn parse(raw: &str) -> Result<Self, ValueError> {
        const KIND: &str = "IdempotencyKey";
        if raw.is_empty() {
            return Err(ValueError::Empty { kind: KIND });
        }
        let (task_part, version_part) = raw.split_once('@').ok_or(ValueError::Malformed {
            kind: KIND,
            found: raw.to_owned(),
            reason: "expected `<task-id>@v<version>`",
        })?;
        let digits = version_part
            .strip_prefix('v')
            .ok_or(ValueError::Malformed {
                kind: KIND,
                found: raw.to_owned(),
                reason: "version must be written `v<number>`",
            })?;
        if digits.is_empty() || !digits.bytes().all(|b| b.is_ascii_digit()) {
            return Err(ValueError::Malformed {
                kind: KIND,
                found: raw.to_owned(),
                reason: "version must be a decimal number",
            });
        }
        let version = digits.parse::<u32>().map_err(|_| ValueError::OutOfRange {
            kind: KIND,
            found: digits.to_owned(),
            permitted: "0..=4294967295",
        })?;
        Ok(Self {
            task: TaskId::parse(task_part)?,
            version,
        })
    }

    /// The Task this key belongs to.
    #[must_use]
    pub fn task(&self) -> &TaskId {
        &self.task
    }

    /// The plan version this key was minted against.
    #[must_use]
    pub fn version(&self) -> u32 {
        self.version
    }
}

impl fmt::Display for IdempotencyKey {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}@v{}", self.task, self.version)
    }
}

impl FromStr for IdempotencyKey {
    type Err = ValueError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::parse(s)
    }
}

// =====================================================================================
// Weight
// =====================================================================================

/// An Objective's share of Mission completion, in `[0, 1]`.
///
/// Mission completion is weighted by Objective rather than by Task count, so that twenty
/// trivial Tasks do not outweigh one hard one (`ARCH` §15.2). That the weights of a Mission's
/// Objectives sum to 1.0 is an invariant of the Objective collection, checked where that
/// collection is assembled, not here.
#[derive(Debug, Clone, Copy, PartialEq, PartialOrd, Serialize, Deserialize)]
pub struct Weight(f64);

impl Weight {
    /// The lower bound, `0.0`.
    pub const MIN: Self = Self(0.0);
    /// The upper bound, `1.0`.
    pub const MAX: Self = Self(1.0);

    /// Construct a weight.
    ///
    /// # Errors
    ///
    /// Returns [`ValueError::OutOfRange`] when the value is not finite or falls outside
    /// `[0, 1]`. `NaN` is rejected: a weight that compares false against everything, itself
    /// included, would silently corrupt every completion calculation it entered.
    pub fn new(value: f64) -> Result<Self, ValueError> {
        if !value.is_finite() || !(0.0..=1.0).contains(&value) {
            return Err(ValueError::OutOfRange {
                kind: "Weight",
                found: format!("{value}"),
                permitted: "0.0..=1.0, finite",
            });
        }
        Ok(Self(value))
    }

    /// The weight as a float, for summation and completion arithmetic.
    #[must_use]
    pub fn as_f64(self) -> f64 {
        self.0
    }
}

impl fmt::Display for Weight {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

// =====================================================================================
// Money
// =====================================================================================

/// A budget amount, held in minor units to avoid floating-point currency arithmetic.
///
/// Rendered as `$45.00`. Non-negative: budgets, reservations and actual costs are all
/// non-negative in this domain, and a negative amount would mean a ceiling had been credited,
/// which nothing in `ARCH` §16.3 permits.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct Money {
    minor_units: i64,
}

impl Money {
    /// Zero.
    pub const ZERO: Self = Self { minor_units: 0 };

    /// Construct from minor units, for example cents.
    ///
    /// # Errors
    ///
    /// Returns [`ValueError::OutOfRange`] when the amount is negative.
    pub fn from_minor_units(minor_units: i64) -> Result<Self, ValueError> {
        if minor_units < 0 {
            return Err(ValueError::OutOfRange {
                kind: "Money",
                found: format!("{minor_units}"),
                permitted: "0..",
            });
        }
        Ok(Self { minor_units })
    }

    /// The amount in minor units.
    #[must_use]
    pub fn minor_units(self) -> i64 {
        self.minor_units
    }

    /// Add two amounts, returning `None` on overflow.
    #[must_use]
    pub fn checked_add(self, other: Self) -> Option<Self> {
        self.minor_units
            .checked_add(other.minor_units)
            .map(|minor_units| Self { minor_units })
    }

    /// Subtract `other`, returning `None` if the result would be negative or overflow.
    ///
    /// Returning `None` rather than saturating is deliberate: a budget that silently floors at
    /// zero is a budget that has been exceeded without anyone noticing.
    #[must_use]
    pub fn checked_sub(self, other: Self) -> Option<Self> {
        self.minor_units
            .checked_sub(other.minor_units)
            .filter(|value| *value >= 0)
            .map(|minor_units| Self { minor_units })
    }

    /// Parse the canonical `$45.00` form. The leading `$` is optional; the two decimal places
    /// are not.
    ///
    /// # Errors
    ///
    /// Returns [`ValueError`] when the input is empty, negative, or not a decimal amount with
    /// exactly two fractional digits.
    pub fn parse(raw: &str) -> Result<Self, ValueError> {
        const KIND: &str = "Money";
        let trimmed = raw.trim();
        if trimmed.is_empty() {
            return Err(ValueError::Empty { kind: KIND });
        }
        let digits = trimmed.strip_prefix('$').unwrap_or(trimmed);
        let malformed = || ValueError::Malformed {
            kind: KIND,
            found: raw.to_owned(),
            reason: "expected an amount such as `$45.00`",
        };
        let (whole, fraction) = digits.split_once('.').ok_or_else(malformed)?;
        if whole.is_empty()
            || fraction.len() != 2
            || !whole.bytes().all(|b| b.is_ascii_digit())
            || !fraction.bytes().all(|b| b.is_ascii_digit())
        {
            return Err(malformed());
        }
        let whole: i64 = whole.parse().map_err(|_| ValueError::OutOfRange {
            kind: KIND,
            found: raw.to_owned(),
            permitted: "0..=92233720368547758",
        })?;
        let fraction: i64 = fraction.parse().map_err(|_| malformed())?;
        let minor_units = whole
            .checked_mul(100)
            .and_then(|value| value.checked_add(fraction))
            .ok_or(ValueError::OutOfRange {
                kind: KIND,
                found: raw.to_owned(),
                permitted: "0..=92233720368547758",
            })?;
        Ok(Self { minor_units })
    }
}

impl fmt::Display for Money {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "${}.{:02}",
            self.minor_units / 100,
            self.minor_units % 100
        )
    }
}

impl FromStr for Money {
    type Err = ValueError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::parse(s)
    }
}

// =====================================================================================
// Duration
// =====================================================================================

/// An estimated or measured span, held in whole seconds.
///
/// Rendered in the largest unit that divides it exactly, so `1080` seconds prints as `18m`,
/// matching the estimates in `ARCH` §6.1. Named `Duration` per the implementation plan; it
/// shadows [`core::time::Duration`] within this module, so import it by path where both are
/// in scope.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct Duration {
    seconds: u64,
}

impl Duration {
    /// Zero.
    pub const ZERO: Self = Self { seconds: 0 };

    /// Construct from whole seconds.
    #[must_use]
    pub fn from_seconds(seconds: u64) -> Self {
        Self { seconds }
    }

    /// The span in whole seconds.
    #[must_use]
    pub fn as_seconds(self) -> u64 {
        self.seconds
    }

    /// Add two spans, returning `None` on overflow.
    #[must_use]
    pub fn checked_add(self, other: Self) -> Option<Self> {
        self.seconds
            .checked_add(other.seconds)
            .map(|seconds| Self { seconds })
    }

    /// Parse the canonical `<number><unit>` form, where unit is `s`, `m`, `h` or `d`.
    ///
    /// # Errors
    ///
    /// Returns [`ValueError`] when the input is empty, carries an unknown unit, omits the
    /// number, or overflows.
    pub fn parse(raw: &str) -> Result<Self, ValueError> {
        const KIND: &str = "Duration";
        let trimmed = raw.trim();
        if trimmed.is_empty() {
            return Err(ValueError::Empty { kind: KIND });
        }
        let malformed = || ValueError::Malformed {
            kind: KIND,
            found: raw.to_owned(),
            reason: "expected a span such as `18m`, with unit s, m, h or d",
        };
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
        if digits.is_empty() || !digits.bytes().all(|b| b.is_ascii_digit()) {
            return Err(malformed());
        }
        let count: u64 = digits.parse().map_err(|_| ValueError::OutOfRange {
            kind: KIND,
            found: raw.to_owned(),
            permitted: "0..=18446744073709551615 seconds",
        })?;
        let seconds = count
            .checked_mul(multiplier)
            .ok_or(ValueError::OutOfRange {
                kind: KIND,
                found: raw.to_owned(),
                permitted: "0..=18446744073709551615 seconds",
            })?;
        Ok(Self { seconds })
    }
}

impl fmt::Display for Duration {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let seconds = self.seconds;
        if seconds != 0 && seconds % 86_400 == 0 {
            write!(f, "{}d", seconds / 86_400)
        } else if seconds != 0 && seconds % 3_600 == 0 {
            write!(f, "{}h", seconds / 3_600)
        } else if seconds != 0 && seconds % 60 == 0 {
            write!(f, "{}m", seconds / 60)
        } else {
            write!(f, "{seconds}s")
        }
    }
}

impl FromStr for Duration {
    type Err = ValueError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::parse(s)
    }
}

// =====================================================================================
// EffectClass
// =====================================================================================

/// How consequential an action is, `0` through `3`.
///
/// The v1 effect classes, unchanged. A Task's class may not exceed its Mission Charter's
/// ceiling (`ARCH` §5.1), and class 3 never retries automatically (`ARCH` §13.3 rule 2).
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub enum EffectClass {
    /// Class 0 — reads only. No change to any state.
    ReadOnly,
    /// Class 1 — writes that are local and reversible.
    Reversible,
    /// Class 2 — writes that are consequential and require approval by default.
    Consequential,
    /// Class 3 — irreversible or externally visible. Always asks; never auto-retries.
    Irreversible,
}

impl EffectClass {
    /// The lowest class.
    pub const MIN_VALUE: u8 = 0;
    /// The highest class.
    pub const MAX_VALUE: u8 = 3;

    /// Construct from its numeric form.
    ///
    /// # Errors
    ///
    /// Returns [`ValueError::OutOfRange`] for any value above 3.
    pub fn from_u8(value: u8) -> Result<Self, ValueError> {
        match value {
            0 => Ok(Self::ReadOnly),
            1 => Ok(Self::Reversible),
            2 => Ok(Self::Consequential),
            3 => Ok(Self::Irreversible),
            _ => Err(ValueError::OutOfRange {
                kind: "EffectClass",
                found: format!("{value}"),
                permitted: "0..=3",
            }),
        }
    }

    /// The numeric form.
    #[must_use]
    pub fn as_u8(self) -> u8 {
        match self {
            Self::ReadOnly => 0,
            Self::Reversible => 1,
            Self::Consequential => 2,
            Self::Irreversible => 3,
        }
    }
}

impl fmt::Display for EffectClass {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.as_u8())
    }
}

// =====================================================================================
// PriorityTier
// =====================================================================================

/// A Mission's declared priority tier, `P0` through `P3`.
///
/// Tiers are declared by a person or by the executive; ordering *within* a tier is computed by
/// the scheduler (`ARCH` §9.3). A tier orders the queue and never relaxes a rule: no tier
/// grants a wider effect class, skips a Guard, or escapes a budget ceiling (`ARCH` §9.5).
///
/// Ordering is by urgency, so `P0 < P1 < P2 < P3` and the most urgent tier sorts first.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Default)]
pub enum PriorityTier {
    /// Something is broken, unsafe, or externally committed today. Rationed; see `ARCH` §9.2.
    P0,
    /// Has a hard deadline or an external commitment.
    P1,
    /// Normal work. The default.
    #[default]
    P2,
    /// Runs when nothing else needs the capacity.
    P3,
}

impl PriorityTier {
    /// Every tier, most urgent first.
    pub const ALL: [Self; 4] = [Self::P0, Self::P1, Self::P2, Self::P3];

    /// The tier's numeric rank, `0` being most urgent.
    #[must_use]
    pub fn rank(self) -> u8 {
        match self {
            Self::P0 => 0,
            Self::P1 => 1,
            Self::P2 => 2,
            Self::P3 => 3,
        }
    }

    /// Construct from a rank.
    ///
    /// # Errors
    ///
    /// Returns [`ValueError::OutOfRange`] for any rank above 3.
    pub fn from_rank(rank: u8) -> Result<Self, ValueError> {
        match rank {
            0 => Ok(Self::P0),
            1 => Ok(Self::P1),
            2 => Ok(Self::P2),
            3 => Ok(Self::P3),
            _ => Err(ValueError::OutOfRange {
                kind: "PriorityTier",
                found: format!("{rank}"),
                permitted: "0..=3",
            }),
        }
    }
}

impl fmt::Display for PriorityTier {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "P{}", self.rank())
    }
}

impl FromStr for PriorityTier {
    type Err = ValueError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "P0" => Ok(Self::P0),
            "P1" => Ok(Self::P1),
            "P2" => Ok(Self::P2),
            "P3" => Ok(Self::P3),
            _ => Err(ValueError::Malformed {
                kind: "PriorityTier",
                found: s.to_owned(),
                reason: "expected P0, P1, P2 or P3",
            }),
        }
    }
}

// =====================================================================================
// DirectiveId
// =====================================================================================

/// The identity of the Principal's originating Directive, e.g. `dir_01J8KQ4Z9F3B7T2Y6R8N0M5V1C`.
///
/// Opaque and generated, like [`MissionId`]. A Mission's Charter names the Directive it serves,
/// so that any plan traces to the intention that caused it (`ARCH` §5.1).
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
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
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
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
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
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
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
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
#[derive(
    Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize, Default,
)]
pub enum ReviewIntensity {
    /// Every optional gate runs.
    Full,
    /// Office reviews plus stage gates. The default.
    #[default]
    Standard,
    /// Stage gates only; Office reviews where a manifest marks them required.
    Lean,
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
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
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

// =====================================================================================
// ContractRef
// =====================================================================================

/// Reference to a Department Capability Contract.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct ContractRef(pub String);

impl ContractRef {
    pub fn parse(raw: impl Into<String>) -> Result<Self, ValueError> {
        let raw = raw.into();
        if raw.is_empty() {
            return Err(ValueError::Empty {
                kind: "ContractRef",
            });
        }
        Ok(Self(raw))
    }

    #[must_use]
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for ContractRef {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

impl FromStr for ContractRef {
    type Err = ValueError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::parse(s)
    }
}

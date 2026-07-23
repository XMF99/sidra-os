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
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
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
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
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
            fences: amendment
                .fences
                .clone()
                .unwrap_or_else(|| self.fences.clone()),
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

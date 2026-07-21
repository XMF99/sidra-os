//! Tests for the Mission Charter aggregate and partial order comparison (M15 / E1 / T1.3).

use std::collections::BTreeSet;

use sidra_mission::domain::charter::{
    Charter, CharterAmendment, CharterError, CharterRelation, CharterSpec,
};
use sidra_mission::domain::values::{
    AutonomyDepth, CalendarDate, DepartmentId, DirectiveId, EffectClass, Fence, MissionId, Money,
    ReviewIntensity,
};

/// Construct a baseline `CharterSpec` from the architecture's example values (`ARCH §5.1`).
fn baseline_spec() -> CharterSpec {
    let mut fences = BTreeSet::new();
    fences.insert(Fence::parse("no_production_writes").unwrap());

    let mut departments = BTreeSet::new();
    departments.insert(DepartmentId::parse("backend").unwrap());

    CharterSpec {
        mission_id: MissionId::parse("msn_01J8KQ4Z9F3B7T2Y6R8N0M5V1C").unwrap(),
        directive_id: DirectiveId::parse("dir_01J8KQ4Z9F3B7T2Y6R8N0M5V1C").unwrap(),
        statement: "Migrate user authentication to OAuth2".to_string(),
        rationale: "Improve security posture and SSO integration".to_string(),
        budget: Money::parse("$50.00").unwrap(),
        effect_ceiling: EffectClass::from_u8(2).unwrap(),
        deadline: Some(CalendarDate::parse("2026-12-31").unwrap()),
        autonomy: AutonomyDepth::new(2).unwrap(),
        review_intensity: ReviewIntensity::Standard,
        fences,
        departments_allowed: departments,
    }
}

fn baseline_charter() -> Charter {
    Charter::new(baseline_spec()).unwrap()
}

#[test]
fn charter_carries_all_eleven_fields() {
    let spec = baseline_spec();
    let c = Charter::new(spec.clone()).expect("valid charter spec");

    assert_eq!(c.mission_id(), &spec.mission_id);
    assert_eq!(c.directive_id(), &spec.directive_id);
    assert_eq!(c.statement(), spec.statement);
    assert_eq!(c.rationale(), spec.rationale);
    assert_eq!(c.budget(), spec.budget);
    assert_eq!(c.effect_ceiling(), spec.effect_ceiling);
    assert_eq!(c.deadline(), spec.deadline);
    assert_eq!(c.autonomy(), spec.autonomy);
    assert_eq!(c.review_intensity(), spec.review_intensity);
    assert_eq!(c.fences(), &spec.fences);
    assert_eq!(c.departments_allowed(), &spec.departments_allowed);
}

#[test]
fn charter_rejects_blank_statement_or_rationale() {
    let mut spec = baseline_spec();
    spec.statement = "   ".to_string();
    assert_eq!(
        Charter::new(spec),
        Err(CharterError::BlankField { field: "statement" })
    );

    let mut spec2 = baseline_spec();
    spec2.rationale = "".to_string();
    assert_eq!(
        Charter::new(spec2),
        Err(CharterError::BlankField { field: "rationale" })
    );
}

#[test]
fn charter_boundary_predicates() {
    let c = baseline_charter();

    // Effect class
    assert!(c.permits_effect_class(EffectClass::from_u8(0).unwrap()));
    assert!(c.permits_effect_class(EffectClass::from_u8(1).unwrap()));
    assert!(c.permits_effect_class(EffectClass::from_u8(2).unwrap()));
    assert!(!c.permits_effect_class(EffectClass::from_u8(3).unwrap()));

    // Budget
    assert!(c.permits_budget(Money::parse("$10.00").unwrap()));
    assert!(c.permits_budget(Money::parse("$50.00").unwrap()));
    assert!(!c.permits_budget(Money::parse("$50.01").unwrap()));

    // Department
    let backend = DepartmentId::parse("backend").unwrap();
    let frontend = DepartmentId::parse("frontend").unwrap();
    assert!(c.permits_department(&backend));
    assert!(!c.permits_department(&frontend));

    // Empty allowlist permits ANY department
    let mut empty_dept_spec = baseline_spec();
    empty_dept_spec.departments_allowed = BTreeSet::new();
    let universal_c = Charter::new(empty_dept_spec).unwrap();
    assert!(universal_c.permits_department(&backend));
    assert!(universal_c.permits_department(&frontend));
}

#[test]
fn narrow_accepts_every_narrowing_amendment() {
    let c = baseline_charter();

    // 1. Lower budget
    let narrow_budget = c
        .narrow(&CharterAmendment {
            budget: Some(Money::parse("$40.00").unwrap()),
            ..Default::default()
        })
        .expect("lower budget is narrower");
    assert_eq!(narrow_budget.budget(), Money::parse("$40.00").unwrap());

    // 2. Lower effect ceiling
    let narrow_ceiling = c
        .narrow(&CharterAmendment {
            effect_ceiling: Some(EffectClass::from_u8(1).unwrap()),
            ..Default::default()
        })
        .expect("lower ceiling is narrower");
    assert_eq!(narrow_ceiling.effect_ceiling(), EffectClass::from_u8(1).unwrap());

    // 3. Earlier deadline
    let narrow_deadline = c
        .narrow(&CharterAmendment {
            deadline: Some(Some(CalendarDate::parse("2026-06-30").unwrap())),
            ..Default::default()
        })
        .expect("earlier deadline is narrower");
    assert_eq!(
        narrow_deadline.deadline(),
        Some(CalendarDate::parse("2026-06-30").unwrap())
    );

    // 4. Lower autonomy
    let narrow_autonomy = c
        .narrow(&CharterAmendment {
            autonomy: Some(AutonomyDepth::new(1).unwrap()),
            ..Default::default()
        })
        .expect("lower autonomy is narrower");
    assert_eq!(narrow_autonomy.autonomy(), AutonomyDepth::new(1).unwrap());

    // 5. Lean -> Standard -> Full (Full is most constrained)
    let narrow_review = c
        .narrow(&CharterAmendment {
            review_intensity: Some(ReviewIntensity::Full),
            ..Default::default()
        })
        .expect("Full is narrower than Standard");
    assert_eq!(narrow_review.review_intensity(), ReviewIntensity::Full);

    // 6. Added fence (superset is narrower)
    let mut more_fences = c.fences().clone();
    more_fences.insert(Fence::parse("no_network").unwrap());
    let narrow_fences = c
        .narrow(&CharterAmendment {
            fences: Some(more_fences),
            ..Default::default()
        })
        .expect("more fences is narrower");
    assert_eq!(narrow_fences.fences().len(), 2);

    // 7. Universal -> allowlist [] -> ["backend"] is narrower
    let mut universal_spec = baseline_spec();
    universal_spec.departments_allowed = BTreeSet::new();
    let universal_c = Charter::new(universal_spec).unwrap();

    let mut subset_dept = BTreeSet::new();
    subset_dept.insert(DepartmentId::parse("backend").unwrap());
    let narrow_dept = universal_c
        .narrow(&CharterAmendment {
            departments_allowed: Some(subset_dept),
            ..Default::default()
        })
        .expect("[] to ['backend'] is narrowing");
    assert_eq!(narrow_dept.departments_allowed().len(), 1);
}

#[test]
fn narrow_rejects_every_widening_amendment() {
    let c = baseline_charter();

    // 1. Higher budget
    assert_eq!(
        c.narrow(&CharterAmendment {
            budget: Some(Money::parse("$60.00").unwrap()),
            ..Default::default()
        }),
        Err(CharterError::WouldWiden { field: "budget" })
    );

    // 2. Higher effect ceiling
    assert_eq!(
        c.narrow(&CharterAmendment {
            effect_ceiling: Some(EffectClass::from_u8(3).unwrap()),
            ..Default::default()
        }),
        Err(CharterError::WouldWiden {
            field: "effect_ceiling"
        })
    );

    // 3. Later deadline or clearing deadline (Some(None))
    assert_eq!(
        c.narrow(&CharterAmendment {
            deadline: Some(Some(CalendarDate::parse("2027-01-01").unwrap())),
            ..Default::default()
        }),
        Err(CharterError::WouldWiden { field: "deadline" })
    );

    assert_eq!(
        c.narrow(&CharterAmendment {
            deadline: Some(None),
            ..Default::default()
        }),
        Err(CharterError::WouldWiden { field: "deadline" })
    );

    // 4. Higher autonomy
    assert_eq!(
        c.narrow(&CharterAmendment {
            autonomy: Some(AutonomyDepth::new(3).unwrap()),
            ..Default::default()
        }),
        Err(CharterError::WouldWiden { field: "autonomy" })
    );

    // 5. Lean review intensity (Standard -> Lean is widening)
    assert_eq!(
        c.narrow(&CharterAmendment {
            review_intensity: Some(ReviewIntensity::Lean),
            ..Default::default()
        }),
        Err(CharterError::WouldWiden {
            field: "review_intensity"
        })
    );

    // 6. Fewer fences (removing a fence is widening)
    assert_eq!(
        c.narrow(&CharterAmendment {
            fences: Some(BTreeSet::new()),
            ..Default::default()
        }),
        Err(CharterError::WouldWiden { field: "fences" })
    );

    // 7. Allowlist -> Universal (['backend'] -> [] is widening)
    assert_eq!(
        c.narrow(&CharterAmendment {
            departments_allowed: Some(BTreeSet::new()),
            ..Default::default()
        }),
        Err(CharterError::WouldWiden {
            field: "departments_allowed"
        })
    );
}

#[test]
fn narrow_rejects_mixed_amendments_as_incomparable() {
    let c = baseline_charter();

    // Lower budget (narrowing) + higher ceiling (widening) in one amendment
    let result = c.narrow(&CharterAmendment {
        budget: Some(Money::parse("$40.00").unwrap()),
        effect_ceiling: Some(EffectClass::from_u8(3).unwrap()),
        ..Default::default()
    });

    assert!(
        matches!(result, Err(CharterError::Incomparable { .. })),
        "mixed amendment must be Incomparable"
    );
}

#[test]
fn narrow_then_widen_is_impossible() {
    let original = baseline_charter();

    // Narrow budget from $50.00 to $40.00
    let narrowed = original
        .narrow(&CharterAmendment {
            budget: Some(Money::parse("$40.00").unwrap()),
            ..Default::default()
        })
        .unwrap();

    // Attempting to widen budget back to $50.00 on the narrowed charter returns WouldWiden
    let attempt_recover = narrowed.narrow(&CharterAmendment {
        budget: Some(Money::parse("$50.00").unwrap()),
        ..Default::default()
    });

    assert_eq!(
        attempt_recover,
        Err(CharterError::WouldWiden { field: "budget" })
    );

    // Comparing narrowed relation to original reports Narrower; original relation to narrowed reports Wider
    assert_eq!(narrowed.relation_to(&original), CharterRelation::Narrower);
    assert_eq!(original.relation_to(&narrowed), CharterRelation::Wider);
    assert!(original.relation_to(&narrowed).requires_principal());
}

#[test]
fn relation_to_reflexive_and_antisymmetric() {
    let c1 = baseline_charter();
    assert_eq!(c1.relation_to(&c1), CharterRelation::Same);

    let c2 = c1
        .narrow(&CharterAmendment {
            budget: Some(Money::parse("$30.00").unwrap()),
            ..Default::default()
        })
        .unwrap();

    assert_eq!(c2.relation_to(&c1), CharterRelation::Narrower);
    assert_eq!(c1.relation_to(&c2), CharterRelation::Wider);
}

#[test]
fn identity_fields_are_incomparable_when_unequal() {
    let c1 = baseline_charter();

    let mut spec2 = baseline_spec();
    spec2.statement = "Completely different statement".to_string();
    let c2 = Charter::new(spec2).unwrap();

    assert_eq!(c2.relation_to(&c1), CharterRelation::Incomparable);
    assert_eq!(c1.relation_to(&c2), CharterRelation::Incomparable);
    assert!(c2.relation_to(&c1).requires_principal());
}

#[test]
fn department_allowlist_universal_and_disjoint_relations() {
    let mut universal_spec = baseline_spec();
    universal_spec.departments_allowed = BTreeSet::new();
    let universal = Charter::new(universal_spec).unwrap();

    let mut backend_spec = baseline_spec();
    let mut backend_set = BTreeSet::new();
    backend_set.insert(DepartmentId::parse("backend").unwrap());
    backend_spec.departments_allowed = backend_set;
    let backend_charter = Charter::new(backend_spec).unwrap();

    let mut incident_spec = baseline_spec();
    let mut incident_set = BTreeSet::new();
    incident_set.insert(DepartmentId::parse("incident-response").unwrap());
    incident_spec.departments_allowed = incident_set;
    let incident_charter = Charter::new(incident_spec).unwrap();

    // [] -> ["backend"] is Narrower
    assert_eq!(
        backend_charter.relation_to(&universal),
        CharterRelation::Narrower
    );
    // ["backend"] -> [] is Wider
    assert_eq!(
        universal.relation_to(&backend_charter),
        CharterRelation::Wider
    );

    // Disjoint allowlists ["backend"] vs ["incident-response"] are Incomparable
    assert_eq!(
        backend_charter.relation_to(&incident_charter),
        CharterRelation::Incomparable
    );
}

#[test]
fn fence_disjoint_sets_are_incomparable() {
    let mut spec1 = baseline_spec();
    let mut set1 = BTreeSet::new();
    set1.insert(Fence::parse("no_production_writes").unwrap());
    spec1.fences = set1;
    let c1 = Charter::new(spec1).unwrap();

    let mut spec2 = baseline_spec();
    let mut set2 = BTreeSet::new();
    set2.insert(Fence::parse("no_network").unwrap());
    spec2.fences = set2;
    let c2 = Charter::new(spec2).unwrap();

    assert_eq!(c1.relation_to(&c2), CharterRelation::Incomparable);
    assert_eq!(c2.relation_to(&c1), CharterRelation::Incomparable);
}

#[test]
fn incomparable_requires_principal() {
    assert!(CharterRelation::Wider.requires_principal());
    assert!(CharterRelation::Incomparable.requires_principal());
    assert!(!CharterRelation::Same.requires_principal());
    assert!(!CharterRelation::Narrower.requires_principal());
}

//! Tests for the domain value objects.  (M15 / E1 / T1.2)
//!
//! T1.2's acceptance criteria are "each rejects invalid construction; `Weight` in [0,1];
//! `EffectClass` in 0-3; property tests". The unit tests below cover named cases; the
//! `properties` module covers the ranges.
//!
//! Property coverage is generated deterministically from a seeded LCG rather than by a
//! property-testing crate. T1.1 established the crate with no dependencies, and E1's
//! acceptance criteria require zero I/O dependencies; adding `proptest` is a dependency
//! decision that belongs to whoever wants it, with its own review. A fixed seed also means a
//! failure reproduces exactly, which is the property that actually matters when one appears
//! in CI.

use sidra_mission::domain::values::{
    AutonomyDepth, CalendarDate, DepartmentId, DirectiveId, Duration, EffectClass, Fence,
    IdempotencyKey, MissionId, Money, ObjectiveId, PriorityTier, ReviewIntensity, TaskId,
    ValueError, Weight,
};

/// A valid Mission identifier body: 26 Crockford base32 characters.
const VALID_BODY: &str = "01J8KQ4Z9F3B7T2Y6R8N0M5V1C";

// =====================================================================================
// MissionId
// =====================================================================================

#[test]
fn mission_id_accepts_the_canonical_form() {
    let raw = format!("msn_{VALID_BODY}");
    let id = MissionId::parse(raw.clone()).expect("canonical form must parse");
    assert_eq!(id.as_str(), raw);
    assert_eq!(id.to_string(), raw);
}

#[test]
fn mission_id_rejects_invalid_construction() {
    let cases: &[(&str, &str)] = &[
        ("", "empty"),
        ("01J8KQ4Z9F3B7T2Y6R8N0M5V1C", "missing prefix"),
        ("tsk_01J8KQ4Z9F3B7T2Y6R8N0M5V1C", "wrong prefix"),
        ("msn_", "empty body"),
        ("msn_01J8KQ4Z9F3B7T2Y6R8N0M5V1", "body too short"),
        ("msn_01J8KQ4Z9F3B7T2Y6R8N0M5V1CX", "body too long"),
        (
            "msn_01J8KQ4Z9F3B7T2Y6R8N0M5V1I",
            "contains excluded letter I",
        ),
        (
            "msn_01J8KQ4Z9F3B7T2Y6R8N0M5V1L",
            "contains excluded letter L",
        ),
        (
            "msn_01J8KQ4Z9F3B7T2Y6R8N0M5V1O",
            "contains excluded letter O",
        ),
        (
            "msn_01J8KQ4Z9F3B7T2Y6R8N0M5V1U",
            "contains excluded letter U",
        ),
        ("msn_01j8kq4z9f3b7t2y6r8n0m5v1c", "lowercase body"),
    ];
    for (input, why) in cases {
        assert!(
            MissionId::parse(*input).is_err(),
            "should have rejected {input:?} ({why})"
        );
    }
}

#[test]
fn mission_id_parses_via_from_str() {
    let raw = format!("msn_{VALID_BODY}");
    let id: MissionId = raw.parse().expect("FromStr must agree with parse");
    assert_eq!(id.as_str(), raw);
}

// =====================================================================================
// ObjectiveId and TaskId
// =====================================================================================

#[test]
fn objective_id_accepts_the_architecture_example() {
    let id = ObjectiveId::parse("obj.failover").expect("ARCH 5.2 example must parse");
    assert_eq!(id.to_string(), "obj.failover");
}

#[test]
fn task_id_accepts_the_architecture_examples() {
    for raw in [
        "tsk.failover.runbook",
        "tsk.failover.topology",
        "tsk.failover.drill",
    ] {
        assert!(TaskId::parse(raw).is_ok(), "ARCH example {raw} must parse");
    }
}

#[test]
fn dotted_ids_reject_invalid_construction() {
    let cases: &[(&str, &str)] = &[
        ("", "empty"),
        ("failover", "missing prefix"),
        ("obj.failover", "wrong prefix for a task"),
        ("tsk.", "no segment after the prefix"),
        ("tsk..runbook", "empty segment"),
        ("tsk.runbook.", "trailing dot"),
        ("tsk.Runbook", "uppercase segment"),
        ("tsk.run_book", "underscore is not permitted"),
        ("tsk.-runbook", "leading hyphen"),
        ("tsk.runbook-", "trailing hyphen"),
        ("tsk.run book", "whitespace"),
    ];
    for (input, why) in cases {
        assert!(
            TaskId::parse(*input).is_err(),
            "should have rejected {input:?} ({why})"
        );
    }
}

#[test]
fn dotted_ids_accept_hyphens_and_digits_inside_segments() {
    for raw in ["tsk.fail-over.runbook-v2", "tsk.stage1.step2"] {
        assert!(TaskId::parse(raw).is_ok(), "{raw} should be permitted");
    }
}

// =====================================================================================
// IdempotencyKey
// =====================================================================================

#[test]
fn idempotency_key_accepts_the_architecture_example() {
    let key = IdempotencyKey::parse("tsk.failover.runbook@v1").expect("ARCH 6.1 example");
    assert_eq!(key.task().as_str(), "tsk.failover.runbook");
    assert_eq!(key.version(), 1);
    assert_eq!(key.to_string(), "tsk.failover.runbook@v1");
}

#[test]
fn idempotency_key_rejects_invalid_construction() {
    let cases: &[(&str, &str)] = &[
        ("", "empty"),
        ("tsk.failover.runbook", "no version"),
        ("tsk.failover.runbook@1", "version marker missing"),
        ("tsk.failover.runbook@v", "no digits"),
        ("tsk.failover.runbook@vx", "non-numeric version"),
        ("obj.failover@v1", "task part is not a task id"),
        ("@v1", "no task part"),
    ];
    for (input, why) in cases {
        assert!(
            IdempotencyKey::parse(input).is_err(),
            "should have rejected {input:?} ({why})"
        );
    }
}

#[test]
fn idempotency_key_round_trips_through_its_parts() {
    let task = TaskId::parse("tsk.failover.drill").expect("valid task id");
    let key = IdempotencyKey::new(task.clone(), 7);
    let reparsed = IdempotencyKey::parse(&key.to_string()).expect("round trip");
    assert_eq!(reparsed, key);
    assert_eq!(reparsed.task(), &task);
}

// =====================================================================================
// Weight
// =====================================================================================

#[test]
fn weight_accepts_the_permitted_range() {
    for value in [0.0, 0.25, 0.5, 1.0] {
        assert!(Weight::new(value).is_ok(), "{value} is inside [0, 1]");
    }
    assert_eq!(Weight::MIN.as_f64(), 0.0);
    assert_eq!(Weight::MAX.as_f64(), 1.0);
}

#[test]
fn weight_rejects_values_outside_the_range() {
    for value in [-0.000_1, 1.000_1, -1.0, 2.0] {
        assert!(Weight::new(value).is_err(), "{value} is outside [0, 1]");
    }
}

#[test]
fn weight_rejects_non_finite_values() {
    for value in [f64::NAN, f64::INFINITY, f64::NEG_INFINITY] {
        assert!(
            Weight::new(value).is_err(),
            "non-finite {value} must be rejected"
        );
    }
}

// =====================================================================================
// Money
// =====================================================================================

#[test]
fn money_accepts_the_architecture_examples() {
    for (raw, minor) in [
        ("$45.00", 4_500_i64),
        ("$4.00", 400),
        ("$3.12", 312),
        ("$2.60", 260),
    ] {
        let money = Money::parse(raw).expect("ARCH example must parse");
        assert_eq!(money.minor_units(), minor, "{raw}");
        assert_eq!(money.to_string(), raw, "display must round-trip {raw}");
    }
}

#[test]
fn money_accepts_a_bare_amount_without_the_symbol() {
    assert_eq!(
        Money::parse("45.00").expect("bare form"),
        Money::parse("$45.00").expect("symbol form")
    );
}

#[test]
fn money_rejects_invalid_construction() {
    let cases: &[(&str, &str)] = &[
        ("", "empty"),
        ("$", "no digits"),
        ("$45", "no fractional part"),
        ("$45.0", "one fractional digit"),
        ("$45.000", "three fractional digits"),
        ("$-45.00", "negative"),
        ("$4a.00", "non-numeric whole part"),
        ("$45.0x", "non-numeric fraction"),
        ("$.00", "no whole part"),
    ];
    for (input, why) in cases {
        assert!(
            Money::parse(input).is_err(),
            "should have rejected {input:?} ({why})"
        );
    }
    assert!(Money::from_minor_units(-1).is_err(), "negative minor units");
}

#[test]
fn money_arithmetic_refuses_to_go_negative() {
    let four = Money::parse("$4.00").expect("valid");
    let ten = Money::parse("$10.00").expect("valid");
    assert_eq!(
        four.checked_sub(ten),
        None,
        "budgets must not floor silently"
    );
    assert_eq!(
        ten.checked_sub(four).map(|m| m.to_string()),
        Some("$6.00".to_owned())
    );
    assert_eq!(
        four.checked_add(ten).map(|m| m.to_string()),
        Some("$14.00".to_owned())
    );
}

// =====================================================================================
// Duration
// =====================================================================================

#[test]
fn duration_accepts_the_architecture_examples() {
    assert_eq!(
        Duration::parse("18m").expect("ARCH 6.1").as_seconds(),
        1_080
    );
    assert_eq!(
        Duration::parse("22m").expect("ARCH 6.1").as_seconds(),
        1_320
    );
}

#[test]
fn duration_displays_in_the_largest_exact_unit() {
    let cases: &[(u64, &str)] = &[
        (0, "0s"),
        (45, "45s"),
        (90, "90s"),
        (1_080, "18m"),
        (3_600, "1h"),
        (7_200, "2h"),
        (86_400, "1d"),
        (90_000, "25h"),
    ];
    for (seconds, expected) in cases {
        assert_eq!(
            Duration::from_seconds(*seconds).to_string(),
            *expected,
            "{seconds} seconds"
        );
    }
}

#[test]
fn duration_rejects_invalid_construction() {
    let cases: &[(&str, &str)] = &[
        ("", "empty"),
        ("18", "no unit"),
        ("m", "no number"),
        ("18w", "unknown unit"),
        ("-5m", "negative"),
        ("1.5h", "fractional"),
        ("18 m", "internal whitespace"),
    ];
    for (input, why) in cases {
        assert!(
            Duration::parse(input).is_err(),
            "should have rejected {input:?} ({why})"
        );
    }
}

#[test]
fn duration_rejects_overflow() {
    assert!(
        Duration::parse("18446744073709551615d").is_err(),
        "multiplication overflow must be an error, not a wrap"
    );
}

#[test]
fn duration_rejects_non_ascii_input_without_panicking() {
    for input in ["18µ", "18€", "١٨m", "18\u{00A0}m"] {
        assert!(
            Duration::parse(input).is_err(),
            "{input:?} must return Err, not panic"
        );
    }
}

// =====================================================================================
// DirectiveId, DepartmentId, Fence, AutonomyDepth, ReviewIntensity, CalendarDate (T1.3)
// =====================================================================================

#[test]
fn directive_id_accepts_valid_form() {
    let raw = format!("dir_{VALID_BODY}");
    let id = DirectiveId::parse(&raw).expect("valid directive id");
    assert_eq!(id.as_str(), raw);
    assert_eq!(id.to_string(), raw);
}

#[test]
fn directive_id_rejects_invalid_form() {
    let bad = [
        "dir_short",
        "msn_01J8KQ4Z9F3B7T2Y6R8N0M5V1C",
        "dir_01J8KQ4Z9F3B7T2Y6R8N0M5V1!",
    ];
    for b in bad {
        assert!(DirectiveId::parse(b).is_err(), "should reject {b}");
    }
}

#[test]
fn department_id_validates_separator_and_chars() {
    assert!(DepartmentId::parse("backend").is_ok());
    assert!(DepartmentId::parse("incident-response").is_ok());

    let invalid = [
        "",
        "-backend",
        "backend-",
        "BackEnd",
        "backend_service",
        "back.end",
    ];
    for inv in invalid {
        assert!(
            DepartmentId::parse(inv).is_err(),
            "should reject department {inv}"
        );
    }
}

#[test]
fn fence_validates_separator_and_chars() {
    assert!(Fence::parse("no_production_writes").is_ok());
    assert!(Fence::parse("read_only").is_ok());

    let invalid = [
        "",
        "_no_writes",
        "no_writes_",
        "no-writes",
        "NoWrites",
        "no.writes",
    ];
    for inv in invalid {
        assert!(Fence::parse(inv).is_err(), "should reject fence {inv}");
    }
}

#[test]
fn autonomy_depth_bounds() {
    for depth in 0..=3 {
        assert!(AutonomyDepth::new(depth).is_ok());
        assert_eq!(AutonomyDepth::new(depth).unwrap().get(), depth);
    }
    assert!(AutonomyDepth::new(4).is_err());
    assert!(AutonomyDepth::new(255).is_err());
}

#[test]
fn review_intensity_ordering_and_parsing() {
    assert!(ReviewIntensity::Full < ReviewIntensity::Standard);
    assert!(ReviewIntensity::Standard < ReviewIntensity::Lean);
    assert_eq!(ReviewIntensity::default(), ReviewIntensity::Standard);

    for (s, expected) in [
        ("full", ReviewIntensity::Full),
        ("standard", ReviewIntensity::Standard),
        ("lean", ReviewIntensity::Lean),
    ] {
        let parsed: ReviewIntensity = s.parse().expect("parse intensity");
        assert_eq!(parsed, expected);
        assert_eq!(parsed.to_string(), s);
    }
    assert!("invalid".parse::<ReviewIntensity>().is_err());
}

#[test]
fn calendar_date_validation_and_parsing() {
    // Valid
    let d = CalendarDate::new(2026, 9, 15).expect("valid date");
    assert_eq!(d.year(), 2026);
    assert_eq!(d.month(), 9);
    assert_eq!(d.day(), 15);
    assert_eq!(d.to_string(), "2026-09-15");

    // Leap year acceptance (Criterion l)
    assert!(
        CalendarDate::new(2024, 2, 29).is_ok(),
        "2024-02-29 is a leap year"
    );

    // Invalid dates (Criterion l)
    let invalid_dates = [
        (2026, 2, 29), // Not leap year
        (2024, 2, 30), // Feb 30 invalid
        (2026, 13, 1), // Month 13 invalid
        (2026, 0, 10), // Month 0 invalid
        (2026, 4, 31), // April has 30 days
        (0, 1, 1),     // Year 0 invalid
    ];
    for (y, m, day) in invalid_dates {
        assert!(
            CalendarDate::new(y, m, day).is_err(),
            "should reject {y}-{m}-{day}"
        );
    }

    // ISO-8601 parsing
    assert_eq!(CalendarDate::parse("2026-09-15").unwrap(), d);
    assert!(CalendarDate::parse("2026/09/15").is_err());
    assert!(CalendarDate::parse("2026-9-15").is_err());
}

// =====================================================================================
// EffectClass
// =====================================================================================

#[test]
fn effect_class_accepts_zero_through_three() {
    for value in 0_u8..=3 {
        let class = EffectClass::from_u8(value).expect("0..=3 are valid");
        assert_eq!(class.as_u8(), value);
        assert_eq!(class.to_string(), value.to_string());
    }
}

#[test]
fn effect_class_rejects_values_above_three() {
    for value in [4_u8, 5, 100, 255] {
        assert!(
            EffectClass::from_u8(value).is_err(),
            "{value} is outside 0..=3"
        );
    }
}

#[test]
fn effect_class_orders_by_consequence() {
    assert!(EffectClass::ReadOnly < EffectClass::Reversible);
    assert!(EffectClass::Reversible < EffectClass::Consequential);
    assert!(EffectClass::Consequential < EffectClass::Irreversible);
}

// =====================================================================================
// PriorityTier
// =====================================================================================

#[test]
fn priority_tier_round_trips_through_its_text_form() {
    for tier in PriorityTier::ALL {
        let text = tier.to_string();
        let parsed: PriorityTier = text.parse().expect("display must be parseable");
        assert_eq!(parsed, tier, "{text}");
    }
}

#[test]
fn priority_tier_rejects_invalid_construction() {
    for input in ["", "P", "P4", "p0", "0", "PO", "critical"] {
        assert!(
            input.parse::<PriorityTier>().is_err(),
            "should have rejected {input:?}"
        );
    }
    assert!(PriorityTier::from_rank(4).is_err());
}

#[test]
fn priority_tier_orders_most_urgent_first() {
    assert!(PriorityTier::P0 < PriorityTier::P1);
    assert!(PriorityTier::P1 < PriorityTier::P2);
    assert!(PriorityTier::P2 < PriorityTier::P3);
}

#[test]
fn priority_tier_defaults_to_standard() {
    assert_eq!(
        PriorityTier::default(),
        PriorityTier::P2,
        "ARCH 9.2: P2 is the default"
    );
}

// =====================================================================================
// Error reporting
// =====================================================================================

#[test]
fn errors_name_the_offending_input() {
    let error = MissionId::parse("nope").expect_err("must fail");
    let rendered = error.to_string();
    assert!(
        rendered.contains("MissionId"),
        "error names the kind: {rendered}"
    );
    assert!(
        rendered.contains("nope"),
        "error names the input: {rendered}"
    );
    assert!(
        matches!(error, ValueError::WrongPrefix { .. }),
        "prefix failures are distinguishable from other failures"
    );
}

// =====================================================================================
// Property tests
// =====================================================================================

mod properties {
    use super::{
        AutonomyDepth, CalendarDate, Duration, EffectClass, MissionId, Money, PriorityTier, TaskId,
        Weight, VALID_BODY,
    };

    /// How many samples each property draws. Large enough to explore the space, small enough
    /// that the suite stays fast.
    const SAMPLES: u32 = 5_000;

    /// A seeded linear congruential generator. Deterministic, so a failing case reproduces.
    struct Lcg(u64);

    impl Lcg {
        const fn new(seed: u64) -> Self {
            Self(seed)
        }

        fn next_u64(&mut self) -> u64 {
            self.0 = self
                .0
                .wrapping_mul(6_364_136_223_846_793_005)
                .wrapping_add(1_442_695_040_888_963_407);
            self.0
        }

        fn next_in(&mut self, bound: u64) -> u64 {
            self.next_u64() % bound
        }
    }

    #[test]
    fn weight_accepts_exactly_the_finite_unit_interval() {
        let mut rng = Lcg::new(0x5EED_0001);
        for _ in 0..SAMPLES {
            // Spread samples across [-1, 2] so both bounds are exercised from both sides.
            let raw = (rng.next_in(3_000_001) as f64) / 1_000_000.0 - 1.0;
            let expected = (0.0..=1.0).contains(&raw);
            assert_eq!(
                Weight::new(raw).is_ok(),
                expected,
                "Weight::new({raw}) disagreed with the range predicate"
            );
        }
    }

    #[test]
    fn money_round_trips_through_its_text_form() {
        let mut rng = Lcg::new(0x5EED_0002);
        for _ in 0..SAMPLES {
            let minor = rng.next_in(1_000_000_000) as i64;
            let money = Money::from_minor_units(minor).expect("non-negative");
            let reparsed = Money::parse(&money.to_string()).expect("display must be parseable");
            assert_eq!(reparsed, money, "round trip failed for {minor} minor units");
        }
    }

    #[test]
    fn money_never_constructs_from_a_negative_amount() {
        let mut rng = Lcg::new(0x5EED_0003);
        for _ in 0..SAMPLES {
            let minor = -((rng.next_in(1_000_000_000) as i64) + 1);
            assert!(
                Money::from_minor_units(minor).is_err(),
                "{minor} must be rejected"
            );
        }
    }

    #[test]
    fn duration_round_trips_when_its_display_is_exact() {
        let mut rng = Lcg::new(0x5EED_0004);
        for _ in 0..SAMPLES {
            let seconds = rng.next_in(10_000_000);
            let duration = Duration::from_seconds(seconds);
            let reparsed = Duration::parse(&duration.to_string()).expect("display is parseable");
            assert_eq!(
                reparsed, duration,
                "round trip failed for {seconds} seconds"
            );
        }
    }

    #[test]
    fn effect_class_accepts_exactly_zero_through_three() {
        for value in 0_u8..=255 {
            assert_eq!(
                EffectClass::from_u8(value).is_ok(),
                value <= 3,
                "EffectClass::from_u8({value}) disagreed with 0..=3"
            );
            if let Ok(class) = EffectClass::from_u8(value) {
                assert_eq!(class.as_u8(), value, "numeric round trip");
            }
        }
    }

    #[test]
    fn priority_tier_accepts_exactly_zero_through_three() {
        for rank in 0_u8..=255 {
            assert_eq!(
                PriorityTier::from_rank(rank).is_ok(),
                rank <= 3,
                "PriorityTier::from_rank({rank}) disagreed with 0..=3"
            );
        }
    }

    #[test]
    fn mission_id_accepts_only_the_crockford_alphabet() {
        const ALPHABET: &[u8] = b"0123456789ABCDEFGHJKMNPQRSTVWXYZ";
        let mut rng = Lcg::new(0x5EED_0005);
        for _ in 0..SAMPLES {
            let body: String = (0..26)
                .map(|_| ALPHABET[rng.next_in(ALPHABET.len() as u64) as usize] as char)
                .collect();
            let raw = format!("msn_{body}");
            assert!(
                MissionId::parse(raw.clone()).is_ok(),
                "generated id {raw} should be valid"
            );
        }
    }

    #[test]
    fn mission_id_rejects_any_excluded_letter_at_any_position() {
        for excluded in ['I', 'L', 'O', 'U'] {
            for position in 0..VALID_BODY.len() {
                let mut body: Vec<char> = VALID_BODY.chars().collect();
                body[position] = excluded;
                let raw: String = format!("msn_{}", body.into_iter().collect::<String>());
                assert!(
                    MissionId::parse(raw.clone()).is_err(),
                    "{raw} contains excluded {excluded} and must be rejected"
                );
            }
        }
    }

    #[test]
    fn task_id_accepts_only_lowercase_alphanumeric_and_hyphen_segments() {
        let mut rng = Lcg::new(0x5EED_0006);
        const PERMITTED: &[u8] = b"abcdefghijklmnopqrstuvwxyz0123456789";
        for _ in 0..SAMPLES {
            let segment: String = (0..1 + rng.next_in(8))
                .map(|_| PERMITTED[rng.next_in(PERMITTED.len() as u64) as usize] as char)
                .collect();
            let raw = format!("tsk.{segment}");
            assert!(TaskId::parse(raw.clone()).is_ok(), "{raw} should be valid");
        }
    }

    #[test]
    fn task_id_rejects_any_uppercase_character_in_any_segment() {
        for (position, _) in "failover".char_indices() {
            let mut segment: Vec<char> = "failover".chars().collect();
            segment[position] = segment[position].to_ascii_uppercase();
            let raw: String = format!("tsk.{}", segment.into_iter().collect::<String>());
            assert!(
                TaskId::parse(raw.clone()).is_err(),
                "{raw} contains uppercase and must be rejected"
            );
        }
    }

    #[test]
    fn autonomy_depth_accepts_exactly_zero_through_three() {
        for depth in 0_u8..=255 {
            assert_eq!(
                AutonomyDepth::new(depth).is_ok(),
                depth <= 3,
                "AutonomyDepth::new({depth}) disagreed with 0..=3"
            );
        }
    }

    #[test]
    fn calendar_date_round_trips_iso_8601() {
        let mut rng = Lcg::new(0x5EED_0007);
        for _ in 0..SAMPLES {
            let year = (1 + rng.next_in(9999)) as u16;
            let month = (1 + rng.next_in(12)) as u8;
            let days_max = CalendarDate::days_in_month(year, month);
            let day = (1 + rng.next_in(days_max as u64)) as u8;

            let date = CalendarDate::new(year, month, day).expect("valid generated date");
            let iso = date.to_string();
            let parsed = CalendarDate::parse(&iso).expect("display must be parseable");
            assert_eq!(date, parsed, "round trip failed for {iso}");
        }
    }
}

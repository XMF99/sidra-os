//! In-crate guard for the rule in ARCH Appendix B / ADR-0022:
//! `sidra-mission` must not depend on `sidra-orchestrator`.
//!
//! `infrastructure/ci/check_dependency_direction.py` is the authoritative check — it sees the
//! resolved graph and therefore catches transitive edges, which this test cannot. This test
//! exists so that `cargo test` alone still fails on the obvious violation, without depending on
//! CI being wired up correctly. Two independent guards for one rule is proportionate for the
//! rule the whole subsystem's separation rests on.
//!
//! Introduced by M10 / E1 / T1.1.

use sidra_mission::FORBIDDEN_DEPENDENCY;

/// This crate's own manifest, embedded at compile time so the test needs no TOML dependency.
const MANIFEST: &str = include_str!(concat!(env!("CARGO_MANIFEST_DIR"), "/Cargo.toml"));

/// Strip `#` comments so that documentation *naming* the forbidden crate is not mistaken for
/// a dependency on it. The manifest deliberately explains the rule in a comment.
fn manifest_without_comments() -> String {
    MANIFEST
        .lines()
        .map(|line| line.split('#').next().unwrap_or(""))
        .collect::<Vec<_>>()
        .join("\n")
}

#[test]
fn manifest_does_not_declare_the_forbidden_dependency() {
    let effective = manifest_without_comments();
    assert!(
        !effective.contains(FORBIDDEN_DEPENDENCY),
        "{} declares a dependency on {}.\n\
         The Mission Engine owns plans and must not be able to execute them (ADR-0022).\n\
         Remove the dependency. Do not suppress this test.",
        env!("CARGO_PKG_NAME"),
        FORBIDDEN_DEPENDENCY,
    );
}

#[test]
fn comment_stripping_does_not_hide_a_real_dependency() {
    // Guards the guard: if `manifest_without_comments` were too aggressive, the test above
    // would pass on a violating manifest. This asserts it still sees a real declaration.
    let sample = "# sidra-orchestrator is forbidden\n[dependencies]\nsidra-orchestrator = \"0.1\"\n";
    let stripped = sample
        .lines()
        .map(|line| line.split('#').next().unwrap_or(""))
        .collect::<Vec<_>>()
        .join("\n");
    assert!(stripped.contains(FORBIDDEN_DEPENDENCY));
}

#[test]
fn comment_stripping_ignores_a_mention_in_a_comment() {
    let sample = "# never depend on sidra-orchestrator\n[dependencies]\n";
    let stripped = sample
        .lines()
        .map(|line| line.split('#').next().unwrap_or(""))
        .collect::<Vec<_>>()
        .join("\n");
    assert!(!stripped.contains(FORBIDDEN_DEPENDENCY));
}

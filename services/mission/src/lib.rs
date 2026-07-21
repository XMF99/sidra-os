//! # Mission Engine
//!
//! The planning subsystem of Sidra OS. It owns Missions: durable intentions with plans
//! attached — Objectives, Tasks, a dependency graph, policies, and verification specifications.
//!
//! The authoritative specification is `docs-v2/03-Intelligence/MISSION_ENGINE_ARCHITECTURE.md`. This crate implements
//! it; it does not amend it.
//!
//! ## The boundary
//!
//! Planning and execution are separate powers held by separate subsystems (ADR-0022).
//!
//! | Subsystem | Owns |
//! |---|---|
//! | `sidra-mission` (this crate) | What should happen, in what order, under what constraints |
//! | `sidra-orchestrator` | Making it happen — Engagements, Work Orders, Turns, agents |
//!
//! Authority flows one way; information flows both ways. This crate emits a Dispatch and
//! receives an Outcome. It has no execution path of its own:
//!
//! - It **must not** call a model, invoke an agent, or use a tool.
//! - It **must not** produce a Deliverable or run a Turn.
//! - It **must not** depend on `sidra-orchestrator`, directly or transitively.
//!
//! That last constraint is mechanically enforced by
//! `infrastructure/ci/check_dependency_direction.py`, which fails the build on the forbidden
//! edge, and is asserted from within the crate by `tests/dependency_direction.rs`. It is a
//! build failure rather than a review responsibility because the seam will otherwise be
//! crossed the first time doing so is convenient.
//!
//! ## Status
//!
//! Milestone M10, Epic E1, Task T1.1 — crate scaffold and dependency-direction enforcement.
//! The domain model itself begins at T1.2. This crate currently exports no items by design;
//! T1.1 delivers a buildable, CI-gated crate and nothing more.

#![forbid(unsafe_code)]
#![deny(missing_docs)]
#![deny(rustdoc::broken_intra_doc_links)]
#![warn(missing_debug_implementations)]
#![warn(unreachable_pub)]

/// The name of the crate this one may never depend on, directly or transitively.
///
/// Declared here so that the in-crate guard in `tests/dependency_direction.rs` and the CI
/// checker refer to the same literal, and so that a reader of the crate root learns the rule
/// from the crate itself rather than only from a script.
///
/// See ADR-0022 and `docs-v2/03-Intelligence/MISSION_ENGINE_ARCHITECTURE.md` §22.1.
pub const FORBIDDEN_DEPENDENCY: &str = "sidra-orchestrator";

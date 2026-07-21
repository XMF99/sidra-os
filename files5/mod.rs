//! The Mission Engine domain model.
//!
//! Pure types and invariants, with no I/O. Persistence is `sidra-mission`'s repository layer
//! (E2); nothing in this module reads a clock, a file, a socket, or a random source.
//!
//! That purity is an acceptance criterion of Epic E1, not a stylistic preference: it is what
//! lets the planner be tested deterministically and what keeps `packages/domain`'s position at
//! the root of the dependency graph honest (ADR-0011).
//!
//! Milestone M15, Epic E1. See `/docs-v2/03-Intelligence/MISSION_ENGINE_IMPLEMENTATION_PLAN.md`.

pub mod values;

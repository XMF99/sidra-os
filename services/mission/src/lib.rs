//! # Mission Engine (M15)
//!
//! The planning subsystem of Sidra OS. It owns Missions: durable intentions with plans
//! attached — Objectives, Tasks, a dependency graph, policies, and verification specifications.
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md, MISSION_ENGINE_IMPLEMENTATION_PLAN.md

#![forbid(unsafe_code)]

pub const FORBIDDEN_DEPENDENCY: &str = "sidra-orchestrator";

pub mod api;
pub mod domain;
pub mod graph;
pub mod integration;
pub mod planner;
pub mod recovery;
pub mod repository;
pub mod risk;
pub mod scheduler;
pub mod state;
pub mod verify;

pub use domain::charter::{Charter, CharterRelation};

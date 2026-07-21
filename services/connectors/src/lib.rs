//! `sidra-connectors` — Layer 1 Kernel Framework for M16 Connector Framework
//!
//! Delivers kernel machinery for installing, granting, authorizing, and mediating
//! connectors to external services.
//!
//! Architectural Invariants:
//! - ADR-0034: Credentials held by kernel in OS keychain, injected at egress boundary.
//! - ADR-0035: Per-department grants primitive (ConnectorGrant carries required DepartmentId).
//! - ADR-0036: Egress declared in manifest `[egress].allow`, enforced by kernel EgressFilter.
//! - ADR-0037: OAuth authorization is a kernel capability (PKCE + refresh).

pub mod conformance;
pub mod custody;
pub mod domain;
pub mod egress;
pub mod host;
pub mod lifecycle;
pub mod manifest;
pub mod mirror;
pub mod oauth;
pub mod registry;

pub use conformance::ConformanceSuite;
pub use custody::{inject_credential, CustodyStore, OutboundRequest};
pub use domain::*;
pub use egress::{build_request, compile_egress, dispatch_request, DispatchResponse};
pub use host::{emit_connector_event, invoke_connector, route_effect_policy, InvocationResult, InvocationVerdict};
pub use lifecycle::{handle_recovered, handle_unreachable, revoke_grant, uninstall_connector, ConnectorState};
pub use manifest::{parse_manifest_toml, validate_install, verify_signature};
pub use mirror::write_connector_mirror;
pub use oauth::{begin_oauth, exchange_code_for_token, validate_callback, OAuthSessionState, RefreshScheduler};
pub use registry::{ConnectorRegistry, GrantStore};

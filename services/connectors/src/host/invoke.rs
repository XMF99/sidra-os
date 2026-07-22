use crate::custody::inject_credential;
use crate::custody::CustodyStore;
use crate::domain::errors::ConnectorError;
use crate::domain::values::{ConnectorId, OperationName};
use crate::egress::{build_request, dispatch_request, DispatchResponse};
use crate::host::effect::{route_effect_policy, InvocationVerdict};
use crate::host::transform::transform_response;
use crate::registry::ConnectorRegistry;
use sidra_domain::DepartmentId;
use sidra_security::PermissionBroker;
use std::collections::HashMap;

/// Result returned from invoke_connector
#[derive(Debug)]
pub enum InvocationResult {
    Ok(DispatchResponse),
    NeedsApproval(sidra_domain::ApprovalRequest),
    Fenced(String),
}

/// Invocation pipeline entry point (T7.1 - T7.4)
///
/// Stage Order:
/// 1. Resolve agent department
/// 2. Check grant existence (ADR-0035 isolation primitive - refusal is structural)
/// 3. Check scope & forbidden set
/// 4. Build request (host from manifest)
/// 5. Route through PermissionBroker (effect-class policy)
/// 6. Inject credential at egress boundary (ADR-0034 custody)
/// 7. Dispatch via egress allowlist (ADR-0036 egress)
/// 8. Transform response
pub fn invoke_connector(
    conn: &rusqlite::Connection,
    agent_id: &str,
    agent_department: &DepartmentId,
    connector_id: &ConnectorId,
    operation_name: &OperationName,
    params: &HashMap<String, String>,
    registry: &ConnectorRegistry,
    custody_store: &CustodyStore,
    broker: &PermissionBroker,
) -> Result<InvocationResult, ConnectorError> {
    // Stage 1: Resolve department (passed in agent_department)

    // Stage 2: Grant existence check (ADR-0035, Exit Criterion AC2)
    // Refusal is structural BEFORE broker, BEFORE request build, BEFORE network!
    let grant = registry
        .grant_store
        .get_grant(connector_id, agent_department)
        .ok_or_else(|| ConnectorError::NoGrant {
            connector_id: connector_id.as_str().to_string(),
            department_id: agent_department.0.clone(),
        })?;

    // Get manifest
    let manifest = registry
        .get_manifest(connector_id)
        .ok_or_else(|| ConnectorError::OperationNotFound {
            connector_id: connector_id.as_str().to_string(),
            operation_name: operation_name.as_str().to_string(),
        })?;

    // Find operation
    let op = manifest
        .operations
        .iter()
        .find(|o| &o.name == operation_name)
        .ok_or_else(|| ConnectorError::OperationNotFound {
            connector_id: connector_id.as_str().to_string(),
            operation_name: operation_name.as_str().to_string(),
        })?;

    // Stage 3: Scope check
    let has_scope = grant.scopes.iter().any(|s| {
        s.as_str() == op.capability.as_str()
            || s.as_str() == &format!("integration:{}:*", connector_id.as_str())
    });

    if !has_scope {
        return Err(ConnectorError::GrantError(format!(
            "Grant for department '{}' does not include required scope '{}'",
            agent_department.0, op.capability
        )));
    }

    // Stage 4: Build request (URL constructed from declared host + path template)
    let (outbound_req, primary_host) = build_request(&manifest, op, params)?;

    // Stage 5: Permission Broker authorization & effect policy (T7.2)
    let verdict = route_effect_policy(conn, agent_id, connector_id.as_str(), op, broker)?;
    match verdict {
        InvocationVerdict::NeedsApproval(req) => return Ok(InvocationResult::NeedsApproval(req)),
        InvocationVerdict::Fenced(reason) => return Ok(InvocationResult::Fenced(reason)),
        InvocationVerdict::Allowed => {}
    }

    // Stage 6: Custody injection at egress boundary (ADR-0034)
    let injected_req = inject_credential(
        outbound_req,
        &manifest.auth,
        grant.keychain_ref.as_ref(),
        custody_store,
    )?;

    // Stage 7: Egress dispatch (ADR-0036)
    let mut allowlist = manifest.egress.allow.clone();
    if !allowlist.contains(&primary_host) {
        allowlist.push(primary_host);
    }

    let response = dispatch_request(&injected_req, &allowlist)?;

    // Stage 8: Transform response
    let final_response = transform_response(response, None)?;

    Ok(InvocationResult::Ok(final_response))
}

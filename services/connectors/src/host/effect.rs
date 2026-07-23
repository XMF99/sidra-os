use crate::domain::errors::ConnectorError;
use crate::domain::operation::Operation;
use rusqlite::Connection;
use sidra_domain::{ApprovalRequest, EffectClass};
use sidra_security::PermissionBroker;

/// Invocation verdict returned by effect routing
#[derive(Debug, Clone, PartialEq)]
pub enum InvocationVerdict {
    Allowed,
    NeedsApproval(ApprovalRequest),
    Fenced(String),
}

/// Route operation through effect-class policy (T7.2, AC6)
///
/// Class 1: external read -> host allowlist
/// Class 2: reversible write -> Approval Request by default
/// Class 3: irreversible/external -> ALWAYS Approval Request
pub fn route_effect_policy(
    conn: &Connection,
    agent_id: &str,
    connector_id: &str,
    operation: &Operation,
    broker: &PermissionBroker,
) -> Result<InvocationVerdict, ConnectorError> {
    let auth_res = broker.authorize_action(
        conn,
        agent_id,
        &operation.capability.0,
        operation.name.as_str(),
        &format!("{}:{}", connector_id, operation.name),
        operation.effect,
    );

    match operation.effect {
        EffectClass::Class0Read => Err(ConnectorError::InstallCheckFailed {
            rule_number: 9,
            rule_name: "no class 0 network operation".into(),
            details: "Network operations cannot be class 0".into(),
        }),
        EffectClass::Class1ReversibleLocal => match auth_res {
            Ok(None) => Ok(InvocationVerdict::Allowed),
            Ok(Some(req)) => Ok(InvocationVerdict::NeedsApproval(req)),
            Err(e) => Ok(InvocationVerdict::Fenced(e.to_string())),
        },
        EffectClass::Class2IrreversibleExternal => match auth_res {
            Ok(None) => Ok(InvocationVerdict::Allowed),
            Ok(Some(req)) => Ok(InvocationVerdict::NeedsApproval(req)),
            Err(e) => Ok(InvocationVerdict::Fenced(e.to_string())),
        },
        EffectClass::Class3CriticalHumanSignature => {
            // Class 3 ALWAYS requires approval
            let req = ApprovalRequest {
                request_id: format!("req_{}", ulid::Ulid::new()),
                agent_id: agent_id.to_string(),
                action: operation.name.as_str().to_string(),
                resource: format!("{}:{}", connector_id, operation.name),
                effect_class: operation.effect,
                reason: format!(
                    "Class 3 critical operation '{}' ALWAYS requires human approval",
                    operation.name
                ),
            };
            Ok(InvocationVerdict::NeedsApproval(req))
        }
    }
}

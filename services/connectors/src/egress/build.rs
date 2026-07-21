use crate::custody::OutboundRequest;
use crate::domain::errors::ConnectorError;
use crate::domain::manifest::ConnectorManifest;
use crate::domain::operation::Operation;
use std::collections::HashMap;

/// Request Builder (ADR-0036, T6.2)
///
/// Constructs URL from manifest's declared host + operation `path_template` + agent parameters.
/// The connector/agent NEVER supplies scheme or host.
pub fn build_request(
    manifest: &ConnectorManifest,
    operation: &Operation,
    params: &HashMap<String, String>,
) -> Result<(OutboundRequest, String), ConnectorError> {
    // Primary declared host from egress.allow
    let primary_host = manifest
        .egress
        .allow
        .first()
        .ok_or_else(|| ConnectorError::EgressBlocked {
            connector_id: manifest.id.as_str().to_string(),
            host: "empty egress.allow".to_string(),
        })?;

    // Perform path template variable substitution: e.g. /repos/{owner}/{repo}/issues
    let mut resolved_path = operation.path.clone();
    for (k, v) in params {
        // Inspect parameter per security model §7.5 (SSRF / vault exfiltration payload check)
        inspect_parameter(k, v)?;
        let placeholder = format!("{{{}}}", k);
        resolved_path = resolved_path.replace(&placeholder, v);
    }

    let full_url = format!("https://{}{}", primary_host, resolved_path);

    let outbound = OutboundRequest {
        url: full_url,
        method: operation.method.clone(),
        headers: HashMap::new(),
        body: None,
    };

    Ok((outbound, primary_host.clone()))
}

fn inspect_parameter(key: &str, val: &str) -> Result<(), ConnectorError> {
    // Egress payload inspection (security model §7.5)
    let lower_val = val.to_lowercase();
    if lower_val.contains("vault:") || lower_val.contains("secret:") || lower_val.contains("private_key") {
        return Err(ConnectorError::EgressBlocked {
            connector_id: "payload_inspection".into(),
            host: format!("Parameter '{}' contains restricted payload pattern", key),
        });
    }
    Ok(())
}

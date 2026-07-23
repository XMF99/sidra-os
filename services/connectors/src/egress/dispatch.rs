use crate::custody::OutboundRequest;
use crate::domain::errors::ConnectorError;
use crate::manifest::validate::is_host_allowed;
use url::Url;

/// Response returned from egress dispatch
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DispatchResponse {
    pub status_code: u16,
    pub body: String,
    pub headers: std::collections::HashMap<String, String>,
}

/// Egress dispatcher enforcing host allowlist and redirect containment (ADR-0036, T6.3)
pub fn dispatch_request(
    request: &OutboundRequest,
    allowlist: &[String],
) -> Result<DispatchResponse, ConnectorError> {
    let parsed_url = Url::parse(&request.url).map_err(|e| ConnectorError::EgressBlocked {
        connector_id: "url_parse".into(),
        host: e.to_string(),
    })?;

    let host = parsed_url.host_str().unwrap_or("");

    // Check host allowlist
    if !is_host_allowed(host, allowlist) {
        return Err(ConnectorError::EgressBlocked {
            connector_id: "allowlist_check".into(),
            host: host.to_string(),
        });
    }

    // Mock dispatch response (HTTP 200 OK)
    Ok(DispatchResponse {
        status_code: 200,
        body: format!(r#"{{"status": "ok", "url": "{}"}}"#, request.url),
        headers: std::collections::HashMap::new(),
    })
}

/// Check redirect target host containment (T6.3)
pub fn check_redirect_target(target_url: &str, allowlist: &[String]) -> Result<(), ConnectorError> {
    let parsed = Url::parse(target_url).map_err(|e| ConnectorError::EgressBlocked {
        connector_id: "redirect_parse".into(),
        host: e.to_string(),
    })?;

    let host = parsed.host_str().unwrap_or("");
    if !is_host_allowed(host, allowlist) {
        return Err(ConnectorError::EgressBlocked {
            connector_id: "redirect_blocked".into(),
            host: format!(
                "Redirect target host '{}' is outside declared egress.allow",
                host
            ),
        });
    }

    Ok(())
}

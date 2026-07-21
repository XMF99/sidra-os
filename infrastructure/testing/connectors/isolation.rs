use sidra_connectors::{
    invoke_connector, ConnectorId, ConnectorRegistry, CustodyStore, OperationName, Scope,
};
use sidra_domain::DepartmentId;
use sidra_security::PermissionBroker;
use std::collections::HashMap;

const VALID_GITHUB_MANIFEST_TOML: &str = r#"
[connector]
id          = "github"
name        = "GitHub Integration"
version     = "1.0.0"
sidra_api   = "^2.0"
publisher   = "sidra-systems"
description = "GitHub connector"

[auth]
kind = "oauth2"
authorize = "https://github.com/login/oauth/authorize"
token     = "https://github.com/login/oauth/access_token"
scopes    = ["repo:read", "issues:write"]
pkce      = true

[egress]
allow = ["api.github.com", "github.com"]

[[operations]]
name       = "list_issues"
capability = "integration:github:read"
effect     = 1
method     = "GET"
path       = "/repos/{owner}/{repo}/issues"

[[operations]]
name       = "create_issue"
capability = "integration:github:write"
effect     = 2
method     = "POST"
path       = "/repos/{owner}/{repo}/issues"

[signature]
publisher = "sidra-systems"
"#;

#[test]
fn test_exit_criterion_structural_cross_department_isolation() {
    let registry = ConnectorRegistry::new();
    let custody_store = CustodyStore::new();
    let broker = PermissionBroker::new();

    // 1. Install connector "github" in developer mode
    let conn_id = registry
        .install_connector(VALID_GITHUB_MANIFEST_TOML, true)
        .expect("Manifest installation must succeed");

    let manifest = registry.get_manifest(&conn_id).unwrap();

    // 2. Grant connector ONLY to Department A ("dept-engineering")
    let dept_a = DepartmentId("dept-engineering".to_string());
    let dept_b = DepartmentId("dept-marketing".to_string());

    let granted_scopes = vec![
        Scope::parse("integration:github:read").unwrap(),
        Scope::parse("integration:github:write").unwrap(),
    ];

    let _grant = registry
        .grant_store
        .grant_connector(&manifest, dept_a.clone(), granted_scopes, "principal", "2026-07-21T00:00:00Z")
        .expect("Grant to dept-engineering must succeed");

    // Authorize credential in custody for dept_a
    let _kref = custody_store
        .store_credential(&conn_id, &dept_a, "mock_oauth_token_a")
        .unwrap();

    // 3. Agent in Dept A invokes list_issues -> MUST succeed
    let mut params = HashMap::new();
    params.insert("owner".to_string(), "XMF99".to_string());
    params.insert("repo".to_string(), "sidra-os".to_string());

    let res_a = invoke_connector(
        "agent-dev-1",
        &dept_a,
        &conn_id,
        &OperationName::new("list_issues"),
        &params,
        &registry,
        &custody_store,
        &broker,
    );

    assert!(res_a.is_ok(), "Dept A agent invocation must succeed");

    // 4. Agent in Dept B invokes create_issue or list_issues -> MUST BE REFUSED STRUCTURALLY (AC2 Exit Criterion!)
    let res_b = invoke_connector(
        "agent-mkt-1",
        &dept_b,
        &conn_id,
        &OperationName::new("list_issues"),
        &params,
        &registry,
        &custody_store,
        &broker,
    );

    match res_b {
        Err(sidra_connectors::ConnectorError::NoGrant { connector_id, department_id }) => {
            assert_eq!(connector_id, "github");
            assert_eq!(department_id, "dept-marketing");
        }
        other => panic!("Expected NoGrant refusal for Dept B, got {:?}", other),
    }
}

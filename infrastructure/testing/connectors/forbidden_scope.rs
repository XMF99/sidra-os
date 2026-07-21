use sidra_connectors::{
    parse_manifest_toml, ConnectorError, ConnectorRegistry, Scope
};
use sidra_domain::DepartmentId;

const MANIFEST_TOML: &str = r#"
[connector]
id          = "github"
name        = "GitHub"
version     = "1.0.0"
sidra_api   = "^2.0"
publisher   = "sidra-systems"
description = "GitHub"

[auth]
kind = "api_key"

[egress]
allow = ["github.com"]

[[operations]]
name       = "op"
capability = "integration:github:write"
effect     = 2
method     = "POST"
path       = "/repo"

[signature]
publisher = "sidra-systems"
"#;

#[test]
fn test_forbidden_scope_grant_refusal() {
    let registry = ConnectorRegistry::new();
    let conn_id = registry.install_connector(MANIFEST_TOML, true).unwrap();
    let manifest = registry.get_manifest(&conn_id).unwrap();

    let dept_mkt = DepartmentId("dept-marketing".to_string());

    // Register forbidden scope for marketing (ADR-0013 self-denial)
    registry.grant_store.set_forbidden_scopes(
        dept_mkt.clone(),
        vec![Scope::parse("integration:github:write").unwrap()],
    );

    // Attempt grant -> MUST fail with ForbiddenScopeDenied
    let grant_res = registry.grant_store.grant_connector(
        &manifest,
        dept_mkt.clone(),
        vec![Scope::parse("integration:github:write").unwrap()],
        "principal",
        "2026-07-21T00:00:00Z",
    );

    match grant_res {
        Err(ConnectorError::ForbiddenScopeDenied { scope, department_id }) => {
            assert_eq!(scope, "integration:github:write");
            assert_eq!(department_id, "dept-marketing");
        }
        other => panic!("Expected ForbiddenScopeDenied, got {:?}", other),
    }
}

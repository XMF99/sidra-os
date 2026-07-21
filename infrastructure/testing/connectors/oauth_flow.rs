use sidra_connectors::{
    begin_oauth, exchange_code_for_token, parse_manifest_toml, validate_callback,
    CustodyStore, RefreshScheduler, ConnectorId
};
use sidra_domain::DepartmentId;

const OAUTH_MANIFEST: &str = r#"
[connector]
id          = "github"
name        = "GitHub"
version     = "1.0.0"
sidra_api   = "^2.0"
publisher   = "sidra-systems"
description = "GitHub"

[auth]
kind      = "oauth2"
authorize = "https://github.com/login/oauth/authorize"
token     = "https://github.com/login/oauth/access_token"
scopes    = ["repo"]
pkce      = true

[egress]
allow = ["github.com"]

[[operations]]
name       = "op"
capability = "integration:github:read"
effect     = 1
method     = "GET"
path       = "/user"
"#;

#[test]
fn test_oauth_flow_and_refresh() {
    let manifest = parse_manifest_toml(OAUTH_MANIFEST).unwrap();
    let custody = CustodyStore::new();

    // 1. Begin OAuth
    let (url, session) = begin_oauth(&manifest, "dept-eng").unwrap();
    assert!(url.contains("github.com/login/oauth/authorize"));
    assert!(url.contains(&session.state));

    // 2. Callback validation
    let valid_callback = validate_callback(&session.state, "code_xyz123", &session);
    assert!(valid_callback.is_ok());

    let invalid_state = validate_callback("wrong_state", "code_xyz123", &session);
    assert!(invalid_state.is_err());

    // 3. Exchange code for token
    let kref = exchange_code_for_token(&manifest, &session, "code_xyz123", &custody).unwrap();
    assert!(custody.get_secret_for_injection(&kref).is_ok());

    // 4. Refresh token
    let scheduler = RefreshScheduler::new();
    let conn_id = ConnectorId::new("github");
    let dept_id = DepartmentId("dept-eng".to_string());

    let refresh_res = scheduler.refresh_token(&conn_id, &dept_id, &custody);
    assert!(refresh_res.is_ok());
}

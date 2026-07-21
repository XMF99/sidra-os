use sidra_connectors::{
    handle_unreachable, uninstall_connector, ConnectorId, ConnectorRegistry, ConnectorState, CustodyStore
};
use sidra_domain::DepartmentId;

#[test]
fn test_offline_degradation_and_uninstall() {
    let registry = ConnectorRegistry::new();
    let custody = CustodyStore::new();
    let conn_id = ConnectorId::new("github");
    let dept_id = DepartmentId("dept-eng".to_string());

    // Mark unreachable
    handle_unreachable(&conn_id, &registry, "Host connection timeout");
    assert_eq!(registry.get_status(&conn_id), Some(ConnectorState::Unreachable));

    // Store credential
    let _kref = custody.store_credential(&conn_id, &dept_id, "token_123").unwrap();

    // Uninstall connector
    uninstall_connector(&conn_id, &registry, &custody, "2026-07-21T00:00:00Z").unwrap();
    assert_eq!(registry.get_status(&conn_id), Some(ConnectorState::Uninstalled));
}

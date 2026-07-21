use sidra_connectors::{ConnectorId, CustodyStore};
use sidra_domain::DepartmentId;

#[test]
fn test_custody_redaction_and_ref_bookkeeping() {
    let custody = CustodyStore::new();
    let conn_id = ConnectorId::new("github");
    let dept_id = DepartmentId("dept-eng".to_string());

    let secret = "super_secret_oauth_token_12345";
    let kref = custody.store_credential(&conn_id, &dept_id, secret).expect("Store must succeed");

    // Assert KeychainRef does NOT contain secret plaintext
    assert_ne!(kref.as_str(), secret);
    assert!(!kref.as_str().contains(secret));

    // Zeroize
    custody.zeroize(&conn_id, &dept_id).expect("Zeroize must succeed");
    assert!(custody.get_secret_for_injection(&kref).is_err());
}

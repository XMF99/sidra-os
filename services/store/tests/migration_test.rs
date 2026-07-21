use sidra_store::Vault;
use tempfile::NamedTempFile;

#[test]
fn test_refinery_migrations_rehearsal() {
    let tmp = NamedTempFile::new().unwrap();
    let vault = Vault::open(tmp.path()).expect("Failed to open and migrate Vault");

    // Verify events table exists
    let count: i64 = vault
        .connection()
        .query_row(
            "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='events'",
            [],
            |row| row.get(0),
        )
        .unwrap();

    assert_eq!(count, 1, "events table must be created by V1 migration");

    // Verify engagements_projection table exists
    let proj_count: i64 = vault
        .connection()
        .query_row(
            "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='engagements_projection'",
            [],
            |row| row.get(0),
        )
        .unwrap();

    assert_eq!(proj_count, 1, "engagements_projection table must be created by V1 migration");
}

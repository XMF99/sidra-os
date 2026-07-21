use sidra_domain::EventInput;
use sidra_store::{EngagementsProjection, EventLogRepository, ProjectionEngine, Vault};
use tempfile::NamedTempFile;
use ulid::Ulid;

#[test]
fn test_m2_exit_criterion_10k_events_hash_chain_and_projection_rebuild() {
    let tmp = NamedTempFile::new().unwrap();
    let db_path = tmp.path().to_path_buf();

    // 1. Initial Phase: Write 5,000 events
    {
        let vault = Vault::open(&db_path).unwrap();
        for i in 1..=5000 {
            let event_id = Ulid::new().to_string();
            let agg_id = format!("eng_{:05}", (i % 100) + 1);
            let input = EventInput {
                event_id,
                event_type: "engagement.created".to_string(),
                aggregate_type: "engagement".to_string(),
                aggregate_id: agg_id.clone(),
                payload: format!(r#"{{"title":"Engagement Work Order {}"}}"#, i),
                metadata: r#"{"source":"test_harness"}"#.to_string(),
                timestamp: "2026-07-21T12:00:00Z".to_string(),
            };
            EventLogRepository::append(vault.connection(), &input).unwrap();
        }
    } // Connection closed mid-run (simulates process crash / restart)

    // 2. Recovery Phase: Relaunch and write remaining 5,000 events (Total 10,000 events)
    {
        let vault = Vault::open(&db_path).unwrap();
        for i in 5001..=10000 {
            let event_id = Ulid::new().to_string();
            let agg_id = format!("eng_{:05}", (i % 100) + 1);
            let input = EventInput {
                event_id,
                event_type: if i % 2 == 0 {
                    "engagement.created".to_string()
                } else {
                    "engagement.completed".to_string()
                },
                aggregate_type: "engagement".to_string(),
                aggregate_id: agg_id,
                payload: format!(r#"{{"title":"Engagement Work Order {}"}}"#, i),
                metadata: r#"{"source":"test_harness"}"#.to_string(),
                timestamp: "2026-07-21T12:05:00Z".to_string(),
            };
            EventLogRepository::append(vault.connection(), &input).unwrap();
        }

        // 3. Verify complete 10,000 event SHA-256 hash chain integrity
        let is_valid = EventLogRepository::verify_chain(vault.connection()).unwrap();
        assert!(is_valid, "SHA-256 hash chain must verify cleanly across 10,000 events");

        // 4. Verify count
        let events = EventLogRepository::read_all(vault.connection()).unwrap();
        assert_eq!(events.len(), 10000, "Event log must contain exactly 10,000 events");

        // 5. Rebuild Engagements projection from scratch
        let rebuilt_count = ProjectionEngine::rebuild(vault.connection(), &EngagementsProjection).unwrap();
        assert_eq!(rebuilt_count, 10000, "Projection engine must process all 10,000 events");

        // 6. Verify projection state contains exact expected 100 engagement rows
        let proj_rows: i64 = vault
            .connection()
            .query_row("SELECT count(*) FROM engagements_projection", [], |row| row.get(0))
            .unwrap();
        assert_eq!(proj_rows, 100, "Engagements projection must contain 100 aggregated rows");
    }
}

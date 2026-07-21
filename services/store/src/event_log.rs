use crate::errors::StoreError;
use rusqlite::{params, Connection};
use sidra_domain::{Event, EventInput, GENESIS_HASH};

pub struct EventLogRepository;

impl EventLogRepository {
    /// Append a new event to the event log within a transaction, computing sequence and SHA-256 hash
    pub fn append(conn: &Connection, input: &EventInput) -> Result<Event, StoreError> {
        let tx = conn.unchecked_transaction()?;

        // Get highest sequence and hash
        let last_event: Option<(i64, String)> = tx
            .query_row(
                "SELECT sequence, hash FROM events ORDER BY sequence DESC LIMIT 1",
                [],
                |row| Ok((row.get(0)?, row.get(1)?)),
            )
            .optional()?;

        let (sequence, prev_hash) = match last_event {
            Some((seq, hash)) => (seq + 1, hash),
            None => (1, GENESIS_HASH.to_string()),
        };

        let hash = Event::compute_hash(
            &prev_hash,
            sequence,
            &input.event_id,
            &input.event_type,
            &input.aggregate_type,
            &input.aggregate_id,
            &input.payload,
            &input.timestamp,
        );

        tx.execute(
            "INSERT INTO events (sequence, event_id, event_type, aggregate_type, aggregate_id, payload, metadata, timestamp, prev_hash, hash)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![
                sequence,
                input.event_id,
                input.event_type,
                input.aggregate_type,
                input.aggregate_id,
                input.payload,
                input.metadata,
                input.timestamp,
                prev_hash,
                hash
            ],
        )?;

        let event = Event {
            sequence,
            event_id: input.event_id.clone(),
            event_type: input.event_type.clone(),
            aggregate_type: input.aggregate_type.clone(),
            aggregate_id: input.aggregate_id.clone(),
            payload: input.payload.clone(),
            metadata: input.metadata.clone(),
            timestamp: input.timestamp.clone(),
            prev_hash,
            hash,
        };

        tx.commit()?;
        Ok(event)
    }

    /// Read all events ordered by sequence ascending
    pub fn read_all(conn: &Connection) -> Result<Vec<Event>, StoreError> {
        let mut stmt = conn.prepare(
            "SELECT sequence, event_id, event_type, aggregate_type, aggregate_id, payload, metadata, timestamp, prev_hash, hash
             FROM events ORDER BY sequence ASC",
        )?;

        let event_iter = stmt.query_map([], |row| {
            Ok(Event {
                sequence: row.get(0)?,
                event_id: row.get(1)?,
                event_type: row.get(2)?,
                aggregate_type: row.get(3)?,
                aggregate_id: row.get(4)?,
                payload: row.get(5)?,
                metadata: row.get(6)?,
                timestamp: row.get(7)?,
                prev_hash: row.get(8)?,
                hash: row.get(9)?,
            })
        })?;

        let mut events = Vec::new();
        for event in event_iter {
            events.push(event?);
        }
        Ok(events)
    }

    /// Verify SHA-256 hash chaining integrity across all events in sequence
    pub fn verify_chain(conn: &Connection) -> Result<bool, StoreError> {
        let events = Self::read_all(conn)?;
        let mut expected_prev_hash = GENESIS_HASH.to_string();

        for event in events {
            if event.prev_hash != expected_prev_hash {
                return Err(StoreError::ChainCorruption {
                    sequence: event.sequence,
                    expected: expected_prev_hash,
                    found: event.prev_hash,
                });
            }

            let computed_hash = Event::compute_hash(
                &event.prev_hash,
                event.sequence,
                &event.event_id,
                &event.event_type,
                &event.aggregate_type,
                &event.aggregate_id,
                &event.payload,
                &event.timestamp,
            );

            if computed_hash != event.hash {
                return Err(StoreError::HashMismatch {
                    sequence: event.sequence,
                    stored: event.hash,
                    computed: computed_hash,
                });
            }

            expected_prev_hash = event.hash;
        }

        Ok(true)
    }
}

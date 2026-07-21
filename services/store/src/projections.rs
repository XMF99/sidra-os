use crate::errors::StoreError;
use crate::event_log::EventLogRepository;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use sidra_domain::Event;

pub trait Projection {
    fn name(&self) -> &'static str;
    fn reset(&self, conn: &Connection) -> Result<(), StoreError>;
    fn apply_event(&self, conn: &Connection, event: &Event) -> Result<(), StoreError>;
}

pub struct ProjectionEngine;

impl ProjectionEngine {
    /// Rebuild a projection table from scratch by reading all events in sequence
    pub fn rebuild<P: Projection>(conn: &Connection, projection: &P) -> Result<usize, StoreError> {
        let tx = conn.unchecked_transaction()?;
        projection.reset(&tx)?;

        let events = EventLogRepository::read_all(&tx)?;
        let count = events.len();

        for event in &events {
            projection.apply_event(&tx, event)?;
        }

        tx.commit()?;
        Ok(count)
    }
}

/// Sample Projection: Engagements Projection Table
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EngagementCreatedPayload {
    pub title: String,
}

pub struct EngagementsProjection;

impl Projection for EngagementsProjection {
    fn name(&self) -> &'static str {
        "engagements_projection"
    }

    fn reset(&self, conn: &Connection) -> Result<(), StoreError> {
        conn.execute("DELETE FROM engagements_projection", [])?;
        Ok(())
    }

    fn apply_event(&self, conn: &Connection, event: &Event) -> Result<(), StoreError> {
        match event.event_type.as_str() {
            "engagement.created" => {
                let payload: EngagementCreatedPayload = serde_json::from_str(&event.payload)?;
                conn.execute(
                    "INSERT INTO engagements_projection (engagement_id, title, status, created_at, updated_at)
                     VALUES (?1, ?2, ?3, ?4, ?5)
                     ON CONFLICT(engagement_id) DO UPDATE SET title=?2, status=?3, updated_at=?5",
                    params![
                        event.aggregate_id,
                        payload.title,
                        "Created",
                        event.timestamp,
                        event.timestamp
                    ],
                )?;
            }
            "engagement.completed" => {
                conn.execute(
                    "UPDATE engagements_projection SET status=?1, updated_at=?2 WHERE engagement_id=?3",
                    params!["Completed", event.timestamp, event.aggregate_id],
                )?;
            }
            _ => {}
        }
        Ok(())
    }
}

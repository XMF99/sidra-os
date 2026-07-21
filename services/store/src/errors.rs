use thiserror::Error;

#[derive(Error, Debug)]
pub enum StoreError {
    #[error("SQLite database error: {0}")]
    Sqlite(#[from] rusqlite::Error),

    #[error("Database migration error: {0}")]
    Migration(#[from] refinery::Error),

    #[error("Event chain corruption at sequence {sequence}: expected prev_hash {expected}, found {found}")]
    ChainCorruption {
        sequence: i64,
        expected: String,
        found: String,
    },

    #[error("Hash verification failure at sequence {sequence}: stored hash {stored} does not match computed hash {computed}")]
    HashMismatch {
        sequence: i64,
        stored: String,
        computed: String,
    },

    #[error("JSON serialization error: {0}")]
    Json(#[from] serde_json::Error),

    #[error("Store error: {0}")]
    Custom(String),
}

use thiserror::Error;

#[derive(Error, Debug)]
pub enum MemoryError {
    #[error("Memory Store Error: {0}")]
    Store(#[from] sidra_store::StoreError),

    #[error("SQLite Error: {0}")]
    Sqlite(#[from] rusqlite::Error),

    #[error("Invalid Vector Dimensions: expected {expected}, got {found}")]
    DimensionMismatch { expected: usize, found: usize },

    #[error("Memory Chunk Not Found: '{0}'")]
    NotFound(String),

    #[error("Context Budget Exceeded: requested {requested} tokens, max budget is {budget}")]
    BudgetExceeded { requested: usize, budget: usize },
}

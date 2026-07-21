use crate::errors::StoreError;
use rusqlite::Connection;
use std::path::Path;

mod embedded {
    use refinery::embed_migrations;
    embed_migrations!("./migrations");
}

pub struct Vault {
    conn: Connection,
}

impl Vault {
    /// Open an in-memory Vault (for testing)
    pub fn open_in_memory() -> Result<Self, StoreError> {
        let mut conn = Connection::open_in_memory()?;
        Self::configure_and_migrate(&mut conn)?;
        Ok(Self { conn })
    }

    /// Open or create a Vault SQLite database at specified file path
    pub fn open<P: AsRef<Path>>(path: P) -> Result<Self, StoreError> {
        let mut conn = Connection::open(path)?;
        Self::configure_and_migrate(&mut conn)?;
        Ok(Self { conn })
    }

    /// Configure PRAGMAs (WAL mode, foreign keys) and run refinery migrations
    fn configure_and_migrate(conn: &mut Connection) -> Result<(), StoreError> {
        conn.execute_batch(
            "PRAGMA journal_mode = WAL;
             PRAGMA synchronous = NORMAL;
             PRAGMA foreign_keys = ON;",
        )?;

        embedded::migrations::runner().run(conn)?;
        Ok(())
    }

    /// Access underlying SQLite connection reference
    pub fn connection(&self) -> &Connection {
        &self.conn
    }

    /// Access underlying mutable SQLite connection reference
    pub fn connection_mut(&mut self) -> &mut Connection {
        &mut self.conn
    }

    /// Re-open from path to simulate restart / crash recovery
    pub fn reopen<P: AsRef<Path>>(path: P) -> Result<Self, StoreError> {
        Self::open(path)
    }
}

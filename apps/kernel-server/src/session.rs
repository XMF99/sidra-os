use serde::{Deserialize, Serialize};
use thiserror::Error;
use ulid::Ulid;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SessionState {
    Connected,
    Authenticated,
    Subscribed,
    Active,
    Disconnected,
}

#[derive(Debug, Error)]
pub enum SessionError {
    #[error("Session is not authenticated (current state: {0:?})")]
    Unauthenticated(SessionState),
    #[error("Session authentication failed: {0}")]
    AuthFailed(String),
}

#[derive(Debug, Clone)]
pub struct ClientSession {
    pub session_id: String,
    pub client_id: Option<String>,
    pub seat_id: Option<String>,
    pub state: SessionState,
    pub connected_at: u64,
}

impl ClientSession {
    pub fn new(timestamp: u64) -> Self {
        Self {
            session_id: format!("sess_{}", Ulid::new()),
            client_id: None,
            seat_id: None,
            state: SessionState::Connected,
            connected_at: timestamp,
        }
    }

    pub fn authenticate(&mut self, client_id: impl Into<String>, seat_id: impl Into<String>) {
        self.client_id = Some(client_id.into());
        self.seat_id = Some(seat_id.into());
        self.state = SessionState::Authenticated;
    }

    pub fn subscribe(&mut self) -> Result<(), SessionError> {
        if self.state != SessionState::Authenticated && self.state != SessionState::Active {
            return Err(SessionError::Unauthenticated(self.state));
        }
        self.state = SessionState::Subscribed;
        Ok(())
    }

    pub fn mark_active(&mut self) -> Result<(), SessionError> {
        if self.state == SessionState::Connected || self.state == SessionState::Disconnected {
            return Err(SessionError::Unauthenticated(self.state));
        }
        self.state = SessionState::Active;
        Ok(())
    }

    pub fn disconnect(&mut self) {
        self.state = SessionState::Disconnected;
    }

    pub fn is_authenticated(&self) -> bool {
        matches!(
            self.state,
            SessionState::Authenticated | SessionState::Subscribed | SessionState::Active
        )
    }
}

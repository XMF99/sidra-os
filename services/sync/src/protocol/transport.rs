use sidra_domain::Event;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum TransportError {
    #[error("Send error: {0}")]
    SendFailed(String),
    #[error("Receive error: {0}")]
    ReceiveFailed(String),
}

pub trait SyncTransport {
    fn send_batch(&mut self, events: &[Event]) -> Result<(), TransportError>;
    fn receive_batch(&mut self) -> Result<Vec<Event>, TransportError>;
}

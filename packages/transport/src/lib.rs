//! Sidra OS Typed RPC Transport Crate (Milestone M23)
//!
//! Provides framing, codec, client, listener, and dispatch adapter
//! carrying the unchanged command/query/event surface over network/IPC boundaries.

pub mod client;
pub mod codec;
pub mod dispatch;
pub mod envelope;
pub mod listen;

pub use client::TransportClient;
pub use codec::TransportCodec;
pub use dispatch::DispatchAdapter;
pub use envelope::{ControlMessage, ResponseStatus, TransportEnvelope, TransportPayload};
pub use listen::{TransportEndpoint, TransportListener};

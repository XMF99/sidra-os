use serde::{Deserialize, Serialize};
use sidra_domain::{AgentMessage, Event, TaskPlan};
use ulid::Ulid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TransportEnvelope {
    pub correlation_id: String,
    pub client_id: Option<String>,
    pub seat_id: Option<String>,
    pub payload: TransportPayload,
}

impl TransportEnvelope {
    pub fn request(correlation_id: impl Into<String>, seat_id: Option<String>, goal: String) -> Self {
        Self {
            correlation_id: correlation_id.into(),
            client_id: None,
            seat_id,
            payload: TransportPayload::Request(RequestPayload { goal }),
        }
    }

    pub fn response(
        correlation_id: impl Into<String>,
        status: ResponseStatus,
        plan: Option<TaskPlan>,
        messages: Vec<AgentMessage>,
        deny_reason: Option<String>,
    ) -> Self {
        Self {
            correlation_id: correlation_id.into(),
            client_id: None,
            seat_id: None,
            payload: TransportPayload::Response(ResponsePayload {
                status,
                plan,
                messages,
                deny_reason,
            }),
        }
    }

    pub fn event_push(event: Event) -> Self {
        Self {
            correlation_id: format!("push_{}", Ulid::new()),
            client_id: None,
            seat_id: Some(event.actor.clone()),
            payload: TransportPayload::EventPush(event),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TransportPayload {
    Request(RequestPayload),
    Response(ResponsePayload),
    EventPush(Event),
    Control(ControlMessage),
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct RequestPayload {
    pub goal: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ResponseStatus {
    Success,
    Denied,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ResponsePayload {
    pub status: ResponseStatus,
    pub plan: Option<TaskPlan>,
    pub messages: Vec<AgentMessage>,
    pub deny_reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ControlMessage {
    Subscribe { since_seq: u64 },
    Subscribed { start_seq: u64 },
    Ping,
    Pong,
    Disconnect { reason: String },
}

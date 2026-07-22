//! M21 Seats and Identity — Value Objects
//! Ref: SEATS_AND_IDENTITY_ARCHITECTURE.md §4.1, ADR-0057

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct SeatId(pub String);

impl SeatId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn generate() -> Self {
        Self(format!("seat_{}", ulid::Ulid::new().to_string().to_lowercase()))
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct ActorValue(pub String);

impl ActorValue {
    pub fn principal() -> Self {
        Self("principal".to_string())
    }

    pub fn from_seat_id(seat_id: &SeatId) -> Self {
        if seat_id.0 == "founding_principal" || seat_id.0 == "principal" {
            Self::principal()
        } else {
            Self(format!("seat:{}", seat_id.0))
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct DisplayName(pub String);

impl DisplayName {
    pub fn parse(name: &str) -> Result<Self, String> {
        let trimmed = name.trim();
        if trimmed.is_empty() {
            return Err("Display name cannot be empty".to_string());
        }
        Ok(Self(trimmed.to_string()))
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SeatStatus {
    Invited,
    Created,
    Active,
    Suspended,
    Retired,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct MemoryNamespace(pub String);

impl MemoryNamespace {
    pub fn from_seat_id(seat_id: &SeatId) -> Self {
        Self(format!("seat/{}", seat_id.0))
    }
}

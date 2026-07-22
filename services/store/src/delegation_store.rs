//! M22 Delegation and Separation of Duties Store Repository
//! Ref: DELEGATION_AND_SEPARATION_ARCHITECTURE.md §7.1, ADR-0060, ADR-0061

use rusqlite::{params, Connection, Result};
use sidra_delegation::{ApprovalResolution, ApprovalVerdict, AuthoritySource, Delegation};

pub struct DelegationStoreRepository<'a> {
    conn: &'a Connection,
}

impl<'a> DelegationStoreRepository<'a> {
    pub fn new(conn: &'a Connection) -> Self {
        Self { conn }
    }

    pub fn insert_delegation(&self, delegation: &Delegation) -> Result<()> {
        let scope_json = serde_json::to_string(&delegation.scope.capabilities).unwrap();
        self.conn.execute(
            "INSERT INTO delegations (
                id, delegator_id, delegatee_id, scope, granted_at, expires_at, granted_by, decision_id, revoked_at, revoked_by
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![
                delegation.id.0,
                delegation.delegator.0,
                delegation.delegatee.0,
                scope_json,
                delegation.granted_at as i64,
                delegation.expires_at as i64,
                delegation.granted_by.0,
                delegation.decision_id,
                delegation.revoked_at.map(|t| t as i64),
                delegation.revoked_by.as_ref().map(|id| id.0.clone()),
            ],
        )?;
        Ok(())
    }

    pub fn insert_approval_resolution(&self, resolution: &ApprovalResolution) -> Result<()> {
        let authority_str = match resolution.authority_source {
            AuthoritySource::OwnFence => "own_fence",
            AuthoritySource::Delegation => "delegation",
        };
        let verdict_str = match resolution.verdict {
            ApprovalVerdict::Granted => "granted",
            ApprovalVerdict::Denied => "denied",
        };

        self.conn.execute(
            "INSERT INTO approval_resolutions (
                id, request_id, approver_seat_id, authority_source, delegation_id, verdict, decision_id, created_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                resolution.id,
                resolution.request_id,
                resolution.approver_seat_id.0,
                authority_str,
                resolution.delegation_id.as_ref().map(|id| id.0.clone()),
                verdict_str,
                resolution.decision_id,
                resolution.created_at as i64,
            ],
        )?;

        Ok(())
    }
}

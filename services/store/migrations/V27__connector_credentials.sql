-- Migration V27: Connector credentials table (M16 Connector Framework)
-- ADR-0034: DB holds keychain_ref, never the secret plaintext
CREATE TABLE IF NOT EXISTS connector_credentials (
    connector_id TEXT NOT NULL,
    department_id TEXT NOT NULL,
    credential_kind TEXT NOT NULL,
    keychain_ref TEXT NOT NULL,
    token_expires_at TEXT,
    refresh_state TEXT,
    PRIMARY KEY (connector_id, department_id)
);

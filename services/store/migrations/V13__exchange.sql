-- M13 Departments: 0013_exchange.sql
-- Creates exchange_requests table (contract-named requests)

CREATE TABLE IF NOT EXISTS exchange_requests (
    request_id TEXT PRIMARY KEY,
    from_department TEXT NOT NULL REFERENCES department_packs(id),
    to_contract TEXT NOT NULL,
    resolved_to_department TEXT NOT NULL REFERENCES department_packs(id),
    objective TEXT NOT NULL,
    status TEXT NOT NULL,
    requested_at INTEGER NOT NULL DEFAULT (unixepoch())
);

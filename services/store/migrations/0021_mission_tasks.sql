-- M15 Mission Engine: 0021_mission_tasks.sql
-- Projections for mission_tasks and mission_edges (ARCH §20.2)

CREATE TABLE IF NOT EXISTS mission_tasks (
    task_id TEXT PRIMARY KEY,
    mission_id TEXT NOT NULL,
    plan_version INTEGER NOT NULL,
    contract_ref TEXT NOT NULL,
    effect_class INTEGER NOT NULL,
    state TEXT NOT NULL DEFAULT 'CREATED',
    estimated_cost REAL NOT NULL,
    estimated_duration INTEGER NOT NULL,
    idempotency_key TEXT,
    FOREIGN KEY (mission_id, plan_version) REFERENCES mission_plans(mission_id, version)
);

CREATE TABLE IF NOT EXISTS mission_edges (
    edge_id TEXT PRIMARY KEY,
    mission_id TEXT NOT NULL,
    plan_version INTEGER NOT NULL,
    from_task TEXT NOT NULL,
    to_task TEXT NOT NULL,
    kind TEXT NOT NULL,
    FOREIGN KEY (mission_id, plan_version) REFERENCES mission_plans(mission_id, version)
);

-- M15 Mission Engine: 0023_mission_dispatches.sql
-- Projections for mission_dispatches (ARCH §20.2)

CREATE TABLE IF NOT EXISTS mission_dispatches (
    dispatch_id TEXT PRIMARY KEY,
    mission_id TEXT NOT NULL,
    task_id TEXT NOT NULL,
    department_id TEXT NOT NULL,
    dispatched_at INTEGER NOT NULL DEFAULT (unixepoch()),
    outcome TEXT,
    failure_class TEXT,
    FOREIGN KEY (mission_id) REFERENCES missions(mission_id),
    FOREIGN KEY (task_id) REFERENCES mission_tasks(task_id)
);

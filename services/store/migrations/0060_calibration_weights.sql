-- Migration 0060: Calibration Weights Table for M26 Outcome Calibration
-- Stores learned risk-dimension weights per parameter version.

CREATE TABLE IF NOT EXISTS calibration_weights (
    version INTEGER NOT NULL REFERENCES calibration_parameters(version),
    dimension TEXT NOT NULL, -- specification, novelty, fragility, cost_variance
    weight REAL NOT NULL,
    PRIMARY KEY (version, dimension)
);

-- Seed Version 0 weights (Equal weights = 0.25 each)
INSERT INTO calibration_weights (version, dimension, weight) VALUES
(0, 'specification', 0.25),
(0, 'novelty', 0.25),
(0, 'fragility', 0.25),
(0, 'cost_variance', 0.25)
ON CONFLICT(version, dimension) DO NOTHING;

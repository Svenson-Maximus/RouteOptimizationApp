ALTER TABLE optimization_runs
    ADD COLUMN IF NOT EXISTS total_route_duration_seconds INTEGER,
    ADD COLUMN IF NOT EXISTS total_distance_meters INTEGER;

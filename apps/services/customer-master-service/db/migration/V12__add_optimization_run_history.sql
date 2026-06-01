CREATE TABLE IF NOT EXISTS optimization_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    weekday TEXT NOT NULL,
    matrix_run_id UUID NOT NULL REFERENCES travel_matrix_runs(id),
    status TEXT NOT NULL,
    objective_value BIGINT,
    eligible_customer_count INTEGER NOT NULL,
    served_customer_count INTEGER NOT NULL,
    dropped_customer_count INTEGER NOT NULL,
    vehicles_used INTEGER NOT NULL,
    total_return_duration_seconds INTEGER,
    time_limit_seconds INTEGER NOT NULL,
    dropped_stop_penalty INTEGER NOT NULL,
    allow_waiting BOOLEAN NOT NULL,
    first_solution_strategy TEXT NOT NULL,
    local_search_metaheuristic TEXT NOT NULL,
    random_seed INTEGER,
    result_json JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_optimization_runs_weekday_created_at
    ON optimization_runs(weekday, created_at DESC);

-- Migration 015: Observability Domain
-- Purpose: System health, SLO tracking, and metrics logging.
-- Dependency: 003_identity_tenancy.
-- Tables Created: system_events, service_health, edge_function_runs, realtime_channel_metrics, ingestion_metrics, query_performance_snapshots, cost_events, error_events, dead_letter_events, slo_measurements
-- Risks: High volume. Needs partition strategy or retention policies.
-- Rollback Notes: DROP SCHEMA observability CASCADE;

CREATE TABLE observability.system_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE observability.service_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    status TEXT NOT NULL,
    last_check TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE observability.edge_function_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    function_name TEXT NOT NULL,
    execution_time_ms INT,
    status TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE observability.realtime_channel_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    channel_name TEXT NOT NULL,
    active_connections INT,
    messages_sent INT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE observability.ingestion_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    batch_size INT,
    latency_ms INT,
    dropped_count INT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE observability.query_performance_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    query_hash TEXT NOT NULL,
    avg_execution_time_ms NUMERIC,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE observability.cost_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL, -- agent_run, eval_run, token_usage
    cost_usd NUMERIC NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE observability.error_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE observability.dead_letter_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB,
    reason TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE observability.slo_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    slo_name TEXT NOT NULL,
    target_value NUMERIC NOT NULL,
    actual_value NUMERIC NOT NULL,
    measured_at TIMESTAMPTZ DEFAULT NOW()
);

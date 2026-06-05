-- Migration 006: Telemetry Domain
-- Purpose: Ingest high-frequency sensor readings, anomaly events, and edge health.
-- Dependency: 005_topology.
-- Tables Created: telemetry_batches, sensor_readings, telemetry_events, edge_health_events, anomaly_events, data_quality_flags, telemetry_ingestion_errors, signal_features, telemetry_partitions_registry.
-- Risks: High data volume. Partitioning strategies needed for production.
-- Rollback Notes: DROP SCHEMA telemetry CASCADE;

CREATE TABLE telemetry.telemetry_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    source_ip TEXT,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    batch_size INT
);

CREATE TABLE telemetry.sensor_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    site_id UUID REFERENCES topology.sites(id),
    asset_id UUID REFERENCES topology.assets(id),
    sensor_id UUID REFERENCES topology.sensors(id) ON DELETE CASCADE,
    edge_node_id UUID, -- Will reference edge.edge_nodes later
    timestamp TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    metric_key TEXT,
    unit TEXT,
    value_numeric NUMERIC,
    value_text TEXT,
    value_bool BOOLEAN,
    quality TEXT,
    confidence NUMERIC,
    source_clock_offset_ms INT,
    raw_payload JSONB,
    payload_hash TEXT,
    signature_status TEXT,
    ingestion_batch_id UUID REFERENCES telemetry.telemetry_batches(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE telemetry.telemetry_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    sensor_id UUID REFERENCES topology.sensors(id) ON DELETE CASCADE,
    value NUMERIC NOT NULL,
    unit TEXT,
    timestamp TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    quality TEXT,
    confidence NUMERIC,
    signature TEXT,
    raw_payload JSONB
);

CREATE TABLE telemetry.edge_health_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    node_id UUID,
    status TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE telemetry.anomaly_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    sensor_id UUID REFERENCES topology.sensors(id),
    event_id UUID REFERENCES telemetry.telemetry_events(id),
    severity TEXT NOT NULL,
    detected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE telemetry.data_quality_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    event_id UUID REFERENCES telemetry.telemetry_events(id) ON DELETE CASCADE,
    flag_type TEXT NOT NULL,
    description TEXT
);

CREATE TABLE telemetry.telemetry_ingestion_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    raw_payload JSONB,
    error_message TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE telemetry.signal_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    sensor_id UUID REFERENCES topology.sensors(id) ON DELETE CASCADE,
    feature_name TEXT,
    feature_value NUMERIC,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE telemetry.telemetry_partitions_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    partition_name TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL
);

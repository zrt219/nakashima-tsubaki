-- Migration 008: Edge Runtime Domain
-- Purpose: Create tables for edge node heartbeats, offline buffering, queues, and policy deployments.
-- Dependency: 005_topology.
-- Tables Created: edge_nodes, edge_node_capabilities, edge_heartbeats, edge_runtime_configs, edge_policies, edge_policy_versions, edge_policy_deployments, edge_sync_batches, edge_action_queue, edge_action_results, edge_incidents, edge_rollbacks, edge_quarantine_events, edge_offline_buffers, edge_command_intents
-- Risks: None.
-- Rollback Notes: DROP SCHEMA edge CASCADE;

CREATE TABLE edge.edge_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    site_id UUID REFERENCES topology.sites(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    allowed_risk_class INT DEFAULT 0
);

CREATE TABLE edge.edge_node_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    node_id UUID REFERENCES edge.edge_nodes(id) ON DELETE CASCADE,
    capability TEXT NOT NULL
);

CREATE TABLE edge.edge_heartbeats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    node_id UUID REFERENCES edge.edge_nodes(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    latency_ms INT
);

CREATE TABLE edge.edge_runtime_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    node_id UUID REFERENCES edge.edge_nodes(id) ON DELETE CASCADE,
    config JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE edge.edge_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE edge.edge_policy_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    policy_id UUID REFERENCES edge.edge_policies(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    rules JSONB NOT NULL,
    signature TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE edge.edge_policy_deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    node_id UUID REFERENCES edge.edge_nodes(id) ON DELETE CASCADE,
    policy_version_id UUID REFERENCES edge.edge_policy_versions(id) ON DELETE CASCADE,
    deployed_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL
);

CREATE TABLE edge.edge_sync_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    node_id UUID REFERENCES edge.edge_nodes(id) ON DELETE CASCADE,
    sync_time TIMESTAMPTZ DEFAULT NOW(),
    records_synced INT
);

CREATE TABLE edge.edge_action_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    node_id UUID REFERENCES edge.edge_nodes(id) ON DELETE CASCADE,
    action_payload JSONB NOT NULL,
    mode TEXT NOT NULL, -- observe_only, shadow_mode, recommendation_mode
    status TEXT NOT NULL,
    risk_class INT DEFAULT 0,
    queued_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE edge.edge_action_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    queue_id UUID REFERENCES edge.edge_action_queue(id) ON DELETE CASCADE,
    result_payload JSONB,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE edge.edge_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    node_id UUID REFERENCES edge.edge_nodes(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE edge.edge_rollbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    node_id UUID REFERENCES edge.edge_nodes(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE edge.edge_quarantine_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    node_id UUID REFERENCES edge.edge_nodes(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE edge.edge_offline_buffers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    node_id UUID REFERENCES edge.edge_nodes(id) ON DELETE CASCADE,
    buffer_size INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE edge.edge_command_intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    node_id UUID REFERENCES edge.edge_nodes(id) ON DELETE CASCADE,
    intent_payload JSONB NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

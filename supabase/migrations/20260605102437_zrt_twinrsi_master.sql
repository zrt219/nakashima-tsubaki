-- ZRT TwinRSI Master Schema Migration

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Schemas
CREATE SCHEMA IF NOT EXISTS topology;
CREATE SCHEMA IF NOT EXISTS telemetry;
CREATE SCHEMA IF NOT EXISTS twin;
CREATE SCHEMA IF NOT EXISTS edge;
CREATE SCHEMA IF NOT EXISTS ledger;
CREATE SCHEMA IF NOT EXISTS knowledge;
CREATE SCHEMA IF NOT EXISTS swarm;
CREATE SCHEMA IF NOT EXISTS rsi;

-------------------------------------------------------------------------------
-- 1. TOPOLOGY SCHEMA
-------------------------------------------------------------------------------
CREATE TABLE topology.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE topology.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES topology.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL
);

CREATE TABLE topology.sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES topology.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    region TEXT,
    timezone TEXT
);

CREATE TABLE topology.zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES topology.sites(id) ON DELETE CASCADE,
    name TEXT NOT NULL
);

CREATE TABLE topology.production_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID REFERENCES topology.zones(id) ON DELETE CASCADE,
    name TEXT NOT NULL
);

CREATE TABLE topology.cells (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_line_id UUID REFERENCES topology.production_lines(id) ON DELETE CASCADE,
    name TEXT NOT NULL
);

CREATE TABLE topology.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cell_id UUID REFERENCES topology.cells(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    criticality TEXT NOT NULL,
    metadata JSONB
);

CREATE TABLE topology.machines (
    id UUID PRIMARY KEY REFERENCES topology.assets(id) ON DELETE CASCADE,
    model TEXT,
    serial_number TEXT
);

CREATE TABLE topology.sensors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES topology.assets(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    unit TEXT,
    metadata JSONB
);

CREATE TABLE topology.actuators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES topology.assets(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT,
    metadata JSONB
);

CREATE TABLE topology.asset_relationships (
    parent_id UUID REFERENCES topology.assets(id) ON DELETE CASCADE,
    child_id UUID REFERENCES topology.assets(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    PRIMARY KEY(parent_id, child_id)
);

CREATE TABLE topology.topology_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES topology.sites(id) ON DELETE CASCADE,
    version_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-------------------------------------------------------------------------------
-- 2. TELEMETRY SCHEMA
-------------------------------------------------------------------------------
CREATE TABLE telemetry.telemetry_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
-- Note: In production, telemetry_events would be partitioned by timestamp.

CREATE TABLE telemetry.telemetry_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_ip TEXT,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    batch_size INT
);

CREATE TABLE telemetry.sensor_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id UUID REFERENCES topology.sensors(id) ON DELETE CASCADE,
    reading NUMERIC NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE telemetry.anomaly_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id UUID REFERENCES topology.sensors(id) ON DELETE CASCADE,
    event_id UUID REFERENCES telemetry.telemetry_events(id) ON DELETE CASCADE,
    severity TEXT NOT NULL,
    detected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE telemetry.edge_health_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id TEXT NOT NULL,
    status TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE telemetry.data_quality_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES telemetry.telemetry_events(id) ON DELETE CASCADE,
    flag_type TEXT NOT NULL,
    description TEXT
);

CREATE TABLE telemetry.telemetry_ingestion_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_payload JSONB,
    error_message TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-------------------------------------------------------------------------------
-- 3. TWIN SCHEMA
-------------------------------------------------------------------------------
CREATE TABLE twin.twin_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES topology.assets(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    status TEXT NOT NULL
);

CREATE TABLE twin.state_estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    twin_id UUID REFERENCES twin.twin_instances(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    inferred_state JSONB NOT NULL,
    confidence NUMERIC,
    provenance TEXT
);

CREATE TABLE twin.twin_state_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    twin_id UUID REFERENCES twin.twin_instances(id) ON DELETE CASCADE,
    snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE twin.twin_drift_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    twin_id UUID REFERENCES twin.twin_instances(id) ON DELETE CASCADE,
    physical_state JSONB,
    edge_cache JSONB,
    cloud_twin JSONB,
    drift_score NUMERIC,
    checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE twin.simulation_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    parameters JSONB
);

CREATE TABLE twin.simulation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID REFERENCES twin.simulation_scenarios(id) ON DELETE CASCADE,
    twin_id UUID REFERENCES twin.twin_instances(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE twin.simulation_outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID REFERENCES twin.simulation_runs(id) ON DELETE CASCADE,
    output_state JSONB NOT NULL,
    is_reality BOOLEAN DEFAULT FALSE,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE twin.forecast_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    twin_id UUID REFERENCES twin.twin_instances(id) ON DELETE CASCADE,
    horizon_seconds INT NOT NULL,
    forecast_state JSONB NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE twin.work_order_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    twin_id UUID REFERENCES twin.twin_instances(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT,
    cited_evidence JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE twin.action_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    twin_id UUID REFERENCES twin.twin_instances(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    parameters JSONB,
    cited_state UUID REFERENCES twin.state_estimates(id),
    cited_simulation UUID REFERENCES twin.simulation_outputs(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-------------------------------------------------------------------------------
-- 4. EDGE SCHEMA
-------------------------------------------------------------------------------
CREATE TABLE edge.edge_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES topology.sites(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL
);

CREATE TABLE edge.edge_node_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID REFERENCES edge.edge_nodes(id) ON DELETE CASCADE,
    capability TEXT NOT NULL
);

CREATE TABLE edge.edge_heartbeats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID REFERENCES edge.edge_nodes(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    latency_ms INT
);

CREATE TABLE edge.edge_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE edge.edge_policy_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID REFERENCES edge.edge_policies(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    rules JSONB NOT NULL,
    signature TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE edge.edge_policy_deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID REFERENCES edge.edge_nodes(id) ON DELETE CASCADE,
    policy_version_id UUID REFERENCES edge.edge_policy_versions(id) ON DELETE CASCADE,
    deployed_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL
);

CREATE TABLE edge.edge_sync_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID REFERENCES edge.edge_nodes(id) ON DELETE CASCADE,
    sync_time TIMESTAMPTZ DEFAULT NOW(),
    records_synced INT
);

CREATE TABLE edge.edge_action_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID REFERENCES edge.edge_nodes(id) ON DELETE CASCADE,
    action_payload JSONB NOT NULL,
    mode TEXT NOT NULL, -- shadow, recommendation, limited
    status TEXT NOT NULL,
    queued_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE edge.edge_action_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_id UUID REFERENCES edge.edge_action_queue(id) ON DELETE CASCADE,
    result_payload JSONB,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE edge.edge_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID REFERENCES edge.edge_nodes(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE edge.edge_rollbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID REFERENCES edge.edge_nodes(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-------------------------------------------------------------------------------
-- 5. LEDGER SCHEMA
-------------------------------------------------------------------------------
CREATE TABLE ledger.governance_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    definition TEXT NOT NULL
);

CREATE TABLE ledger.risk_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    max_allowed_edge_risk INT NOT NULL
);

CREATE TABLE ledger.approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_action TEXT NOT NULL,
    risk_class_id UUID REFERENCES ledger.risk_classes(id),
    status TEXT NOT NULL,
    requested_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ledger.approval_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES ledger.approval_requests(id) ON DELETE CASCADE,
    decision TEXT NOT NULL,
    approver_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ledger.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ledger.evidence_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    storage_path TEXT NOT NULL
);

CREATE TABLE ledger.hash_chain_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_type TEXT NOT NULL,
    record_id UUID NOT NULL,
    previous_hash TEXT,
    current_hash TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ledger.signed_releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version TEXT NOT NULL,
    release_notes TEXT,
    signature TEXT NOT NULL,
    released_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ledger.incident_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    severity TEXT NOT NULL,
    description TEXT,
    reported_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ledger.policy_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID REFERENCES edge.edge_policies(id),
    reason TEXT NOT NULL,
    granted_by TEXT NOT NULL,
    valid_until TIMESTAMPTZ
);

CREATE TABLE ledger.human_authority_scopes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id TEXT NOT NULL,
    scope TEXT NOT NULL
);

-------------------------------------------------------------------------------
-- 6. KNOWLEDGE SCHEMA
-------------------------------------------------------------------------------
CREATE TABLE knowledge.knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    source_type TEXT NOT NULL,
    authority_level TEXT NOT NULL
);

CREATE TABLE knowledge.document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES knowledge.knowledge_documents(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE knowledge.sop_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_version_id UUID REFERENCES knowledge.document_versions(id) ON DELETE CASCADE,
    is_verified BOOLEAN DEFAULT FALSE
);

CREATE TABLE knowledge.knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_version_id UUID REFERENCES knowledge.document_versions(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    chunk_hash TEXT NOT NULL
);

CREATE TABLE knowledge.chunk_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chunk_id UUID REFERENCES knowledge.knowledge_chunks(id) ON DELETE CASCADE,
    embedding vector(1536)
);

CREATE TABLE knowledge.retrieval_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE knowledge.retrieval_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id UUID REFERENCES knowledge.retrieval_queries(id) ON DELETE CASCADE,
    chunk_id UUID REFERENCES knowledge.knowledge_chunks(id) ON DELETE CASCADE,
    similarity_score NUMERIC NOT NULL
);

CREATE TABLE knowledge.citation_spans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    result_id UUID REFERENCES knowledge.retrieval_results(id) ON DELETE CASCADE,
    span_text TEXT NOT NULL
);

CREATE TABLE knowledge.knowledge_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE
);

CREATE TABLE knowledge.unresolved_assumptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assumption TEXT NOT NULL,
    logged_at TIMESTAMPTZ DEFAULT NOW()
);

-------------------------------------------------------------------------------
-- 7. SWARM SCHEMA
-------------------------------------------------------------------------------
CREATE TABLE swarm.agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    model TEXT NOT NULL
);

CREATE TABLE swarm.agent_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES swarm.agents(id) ON DELETE CASCADE,
    role TEXT NOT NULL -- Atlas, Forge, Scribe, Sentinel, Operator
);

CREATE TABLE swarm.agent_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES swarm.agents(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE swarm.agent_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID REFERENCES swarm.agent_runs(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    description TEXT
);

CREATE TABLE swarm.tool_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_id UUID REFERENCES swarm.agent_steps(id) ON DELETE CASCADE,
    tool_name TEXT NOT NULL,
    inputs JSONB,
    outputs JSONB
);

CREATE TABLE swarm.agent_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID REFERENCES swarm.agent_runs(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE swarm.agent_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID REFERENCES swarm.agent_runs(id) ON DELETE CASCADE,
    observation TEXT NOT NULL
);

CREATE TABLE swarm.agent_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID REFERENCES swarm.agent_runs(id) ON DELETE CASCADE,
    decision TEXT NOT NULL,
    confidence NUMERIC
);

CREATE TABLE swarm.agent_risk_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID REFERENCES swarm.agent_runs(id) ON DELETE CASCADE,
    flag_type TEXT NOT NULL,
    severity TEXT NOT NULL
);

CREATE TABLE swarm.agent_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES swarm.agents(id) ON DELETE CASCADE,
    permission_scope TEXT NOT NULL
);

CREATE TABLE swarm.swarm_coordination_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    payload JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-------------------------------------------------------------------------------
-- 8. RSI SCHEMA
-------------------------------------------------------------------------------
CREATE TABLE rsi.improvement_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE rsi.hypotheses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID REFERENCES rsi.improvement_cycles(id) ON DELETE CASCADE,
    evidence_cited TEXT NOT NULL,
    proposed_solution TEXT NOT NULL
);

CREATE TABLE rsi.proposed_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hypothesis_id UUID REFERENCES rsi.hypotheses(id) ON DELETE CASCADE,
    diff_payload TEXT NOT NULL
);

CREATE TABLE rsi.change_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposed_change_id UUID REFERENCES rsi.proposed_changes(id) ON DELETE CASCADE,
    status TEXT NOT NULL
);

CREATE TABLE rsi.eval_suites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    version TEXT NOT NULL
);

CREATE TABLE rsi.eval_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suite_id UUID REFERENCES rsi.eval_suites(id) ON DELETE CASCADE,
    change_set_id UUID REFERENCES rsi.change_sets(id) ON DELETE CASCADE,
    status TEXT NOT NULL
);

CREATE TABLE rsi.eval_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID REFERENCES rsi.eval_runs(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    score NUMERIC NOT NULL,
    passed BOOLEAN NOT NULL
);

CREATE TABLE rsi.regression_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID REFERENCES rsi.eval_runs(id) ON DELETE CASCADE,
    baseline_score NUMERIC NOT NULL,
    new_score NUMERIC NOT NULL,
    regression_detected BOOLEAN NOT NULL
);

CREATE TABLE rsi.safety_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID REFERENCES rsi.eval_runs(id) ON DELETE CASCADE,
    check_name TEXT NOT NULL,
    passed BOOLEAN NOT NULL
);

CREATE TABLE rsi.capability_deltas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID REFERENCES rsi.eval_runs(id) ON DELETE CASCADE,
    capability TEXT NOT NULL,
    improvement NUMERIC NOT NULL
);

CREATE TABLE rsi.rsi_readiness_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    change_set_id UUID REFERENCES rsi.change_sets(id) ON DELETE CASCADE,
    readiness_score NUMERIC NOT NULL,
    is_ready BOOLEAN NOT NULL
);

CREATE TABLE rsi.rollback_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    change_set_id UUID REFERENCES rsi.change_sets(id) ON DELETE CASCADE,
    rollback_instructions TEXT NOT NULL
);

CREATE TABLE rsi.improvement_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lane TEXT NOT NULL, -- source_memory, decision_memory, capability_memory, failure_memory
    content TEXT NOT NULL,
    logged_at TIMESTAMPTZ DEFAULT NOW()
);

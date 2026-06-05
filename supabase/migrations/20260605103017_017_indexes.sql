-- Migration 017: Indexes
-- Purpose: Optimize telemetry retrieval, vector searches, and org scoping.
-- Dependency: 002-015 tables.
-- Tables Created: None. (Creates Indexes)
-- Risks: Locking during index creation if table is large (use CONCURRENTLY in prod).
-- Rollback Notes: DROP INDEX ...

-- Topology
CREATE INDEX idx_topology_assets_org ON topology.assets(organization_id);
CREATE INDEX idx_topology_sensors_asset ON topology.sensors(asset_id);

-- Telemetry
CREATE INDEX idx_telemetry_events_org_time ON telemetry.telemetry_events(organization_id, timestamp DESC);
CREATE INDEX idx_telemetry_events_sensor_time ON telemetry.telemetry_events(sensor_id, timestamp DESC);
CREATE INDEX idx_telemetry_sensor_readings_org_time ON telemetry.sensor_readings(organization_id, timestamp DESC);

-- Twin
CREATE INDEX idx_twin_estimates_twin_time ON twin.inferred_state_estimates(twin_id, estimated_at DESC);

-- Edge
CREATE INDEX idx_edge_action_queue_node ON edge.edge_action_queue(node_id, status);

-- Ledger
CREATE INDEX idx_governance_audit_org_time ON governance.audit_log(organization_id, timestamp DESC);

-- Knowledge (Vector)
CREATE INDEX idx_rag_chunk_embeddings_org ON rag.chunk_embeddings(organization_id);
CREATE INDEX idx_rag_chunk_embeddings_embedding ON rag.chunk_embeddings USING hnsw (embedding vector_cosine_ops);

-- Agents
CREATE INDEX idx_agents_tool_calls_step ON agents.tool_calls(step_id);

-- RSI
CREATE INDEX idx_rsi_eval_runs_org_status ON rsi.eval_runs(organization_id, status);

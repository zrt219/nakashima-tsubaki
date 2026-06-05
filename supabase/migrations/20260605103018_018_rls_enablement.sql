-- Migration 018: RLS Enablement
-- Purpose: Enable Row Level Security (RLS) across all tables in all schemas.
-- Dependency: All schemas.
-- Tables Created: None.
-- Risks: Locks out all queries that don't match upcoming RLS policies.
-- Rollback Notes: ALTER TABLE ... DISABLE ROW LEVEL SECURITY;

-- Identity
ALTER TABLE identity.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.profiles ENABLE ROW LEVEL SECURITY;

-- Topology
ALTER TABLE topology.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE topology.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE topology.production_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE topology.cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE topology.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE topology.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE topology.sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE topology.actuators ENABLE ROW LEVEL SECURITY;

-- Telemetry
ALTER TABLE telemetry.telemetry_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry.anomaly_events ENABLE ROW LEVEL SECURITY;

-- Twin
ALTER TABLE twin.twin_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE twin.inferred_state_estimates ENABLE ROW LEVEL SECURITY;

-- Edge
ALTER TABLE edge.edge_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE edge.edge_action_queue ENABLE ROW LEVEL SECURITY;

-- Ledger
ALTER TABLE governance.approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance.approval_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance.audit_log ENABLE ROW LEVEL SECURITY;

-- RAG
ALTER TABLE rag.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag.knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag.chunk_embeddings ENABLE ROW LEVEL SECURITY;

-- Swarm
ALTER TABLE agents.agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents.tool_calls ENABLE ROW LEVEL SECURITY;

-- RSI
ALTER TABLE rsi.improvement_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsi.eval_runs ENABLE ROW LEVEL SECURITY;

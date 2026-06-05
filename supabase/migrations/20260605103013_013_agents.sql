-- Migration 013: Agent Swarm Domain
-- Purpose: Track multi-agent operations with strict tool usage and risk constraints.
-- Dependency: 003_identity_tenancy.
-- Tables Created: agents, agent_roles, agent_permissions, agent_runs, agent_steps, tool_calls, agent_messages, agent_observations, agent_decisions, agent_risk_flags, swarm_coordination_events, agent_memory_links, agent_eval_links
-- Risks: None.
-- Rollback Notes: DROP SCHEMA agents CASCADE;

CREATE TABLE agents.agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    model TEXT NOT NULL
);

CREATE TABLE agents.agent_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents.agents(id) ON DELETE CASCADE,
    role TEXT NOT NULL -- Atlas, Forge, Scribe, Sentinel, Operator
);

CREATE TABLE agents.agent_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents.agents(id) ON DELETE CASCADE,
    permission_scope TEXT NOT NULL -- file_read, file_write, sql_generate, sql_execute_sandbox, edge_policy_propose, rag_read, telemetry_read
);

CREATE TABLE agents.agent_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents.agents(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE agents.agent_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    run_id UUID REFERENCES agents.agent_runs(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    description TEXT
);

CREATE TABLE agents.tool_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    step_id UUID REFERENCES agents.agent_steps(id) ON DELETE CASCADE,
    tool_name TEXT NOT NULL,
    inputs JSONB,
    outputs JSONB
);

CREATE TABLE agents.agent_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    run_id UUID REFERENCES agents.agent_runs(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE agents.agent_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    run_id UUID REFERENCES agents.agent_runs(id) ON DELETE CASCADE,
    observation TEXT NOT NULL
);

CREATE TABLE agents.agent_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    run_id UUID REFERENCES agents.agent_runs(id) ON DELETE CASCADE,
    decision TEXT NOT NULL,
    confidence NUMERIC
);

CREATE TABLE agents.agent_risk_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    run_id UUID REFERENCES agents.agent_runs(id) ON DELETE CASCADE,
    flag_type TEXT NOT NULL,
    severity TEXT NOT NULL
);

CREATE TABLE agents.swarm_coordination_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE agents.agent_memory_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    run_id UUID REFERENCES agents.agent_runs(id) ON DELETE CASCADE,
    memory_key TEXT NOT NULL,
    memory_value JSONB NOT NULL
);

CREATE TABLE agents.agent_eval_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    run_id UUID REFERENCES agents.agent_runs(id) ON DELETE CASCADE,
    eval_id UUID -- References rsi.eval_runs
);

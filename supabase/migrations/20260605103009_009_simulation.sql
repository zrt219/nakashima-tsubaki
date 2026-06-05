-- Migration 009: Simulation and Replay Domain
-- Purpose: Scenarios, simulations, and replay packet logic for the twin.
-- Dependency: 007_twin_base.
-- Tables Created: scenario_templates, scenario_parameters, scenario_runs, simulation_runs, simulation_outputs, signal_timelines, shadow_execution_runs, counterfactual_branches, replay_packets, replay_events, training_sessions, operator_training_scores
-- Risks: None.
-- Rollback Notes: DROP SCHEMA simulation CASCADE;

CREATE TABLE simulation.scenario_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT
);

CREATE TABLE simulation.scenario_parameters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    scenario_id UUID REFERENCES simulation.scenario_templates(id) ON DELETE CASCADE,
    parameters JSONB NOT NULL
);

CREATE TABLE simulation.scenario_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    scenario_id UUID REFERENCES simulation.scenario_templates(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL
);

CREATE TABLE simulation.simulation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    twin_id UUID REFERENCES twin.twin_instances(id) ON DELETE CASCADE,
    scenario_id UUID REFERENCES simulation.scenario_templates(id),
    status TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE simulation.simulation_outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    run_id UUID REFERENCES simulation.simulation_runs(id) ON DELETE CASCADE,
    output_state JSONB NOT NULL,
    is_reality BOOLEAN DEFAULT FALSE, -- Must always be FALSE in application logic
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE simulation.signal_timelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    run_id UUID REFERENCES simulation.simulation_runs(id) ON DELETE CASCADE,
    timeline_data JSONB NOT NULL
);

CREATE TABLE simulation.shadow_execution_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    twin_id UUID REFERENCES twin.twin_instances(id) ON DELETE CASCADE,
    execution_result JSONB NOT NULL,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE simulation.counterfactual_branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    run_id UUID REFERENCES simulation.simulation_runs(id) ON DELETE CASCADE,
    branch_logic JSONB NOT NULL
);

CREATE TABLE simulation.replay_packets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    run_id UUID REFERENCES simulation.simulation_runs(id) ON DELETE CASCADE,
    event_chain JSONB,
    evidence_artifacts JSONB,
    local_evidence_hash TEXT,
    exported_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE simulation.replay_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    packet_id UUID REFERENCES simulation.replay_packets(id) ON DELETE CASCADE,
    event_data JSONB NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE simulation.training_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES identity.profiles(id) ON DELETE CASCADE,
    scenario_id UUID REFERENCES simulation.scenario_templates(id),
    started_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE simulation.operator_training_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    session_id UUID REFERENCES simulation.training_sessions(id) ON DELETE CASCADE,
    score NUMERIC NOT NULL
);

-- Migration 007: Twin Execution Domain
-- Purpose: Separate observed facts from inferred state and model physical system twins.
-- Dependency: 005_topology.
-- Tables Created: twin_instances, twin_versions, twin_state_snapshots, observed_state_facts, inferred_state_estimates, state_confidence_scores, twin_drift_checks, twin_calibration_events, twin_asset_bindings, twin_model_parameters, twin_state_transitions
-- Risks: None.
-- Rollback Notes: DROP SCHEMA twin CASCADE;

CREATE TABLE twin.twin_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES topology.assets(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    status TEXT NOT NULL
);

CREATE TABLE twin.twin_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    twin_id UUID REFERENCES twin.twin_instances(id) ON DELETE CASCADE,
    version_string TEXT NOT NULL,
    released_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE twin.twin_state_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    twin_id UUID REFERENCES twin.twin_instances(id) ON DELETE CASCADE,
    snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE twin.observed_state_facts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    twin_id UUID REFERENCES twin.twin_instances(id) ON DELETE CASCADE,
    fact_payload JSONB NOT NULL,
    observed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE twin.inferred_state_estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    twin_id UUID REFERENCES twin.twin_instances(id) ON DELETE CASCADE,
    inferred_state JSONB NOT NULL,
    confidence NUMERIC,
    provenance_event_id UUID,
    estimated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE twin.state_confidence_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    twin_id UUID REFERENCES twin.twin_instances(id) ON DELETE CASCADE,
    score NUMERIC NOT NULL,
    scored_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE twin.twin_drift_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    twin_id UUID REFERENCES twin.twin_instances(id) ON DELETE CASCADE,
    physical_state JSONB,
    edge_cache JSONB,
    cloud_twin JSONB,
    drift_score NUMERIC,
    checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE twin.twin_calibration_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    twin_id UUID REFERENCES twin.twin_instances(id) ON DELETE CASCADE,
    calibration_data JSONB,
    calibrated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE twin.twin_asset_bindings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    twin_id UUID REFERENCES twin.twin_instances(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES topology.assets(id) ON DELETE CASCADE
);

CREATE TABLE twin.twin_model_parameters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    twin_id UUID REFERENCES twin.twin_instances(id) ON DELETE CASCADE,
    parameters JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE twin.twin_state_transitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    twin_id UUID REFERENCES twin.twin_instances(id) ON DELETE CASCADE,
    previous_state JSONB,
    new_state JSONB,
    transitioned_at TIMESTAMPTZ DEFAULT NOW()
);

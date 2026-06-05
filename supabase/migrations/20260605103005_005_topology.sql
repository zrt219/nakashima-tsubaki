-- Migration 005: Topology Domain
-- Purpose: Create physical topology domain tables supporting factories, mines, and robotics cells.
-- Dependency: 003_identity_tenancy.
-- Tables Created: sites, zones, production_lines, cells, assets, machines, sensors, actuators, asset_relationships, asset_tags, topology_versions, topology_change_events.
-- Risks: None.
-- Rollback Notes: DROP SCHEMA topology CASCADE;

CREATE TABLE topology.sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    region TEXT,
    timezone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE topology.zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    site_id UUID REFERENCES topology.sites(id) ON DELETE CASCADE,
    name TEXT NOT NULL
);

CREATE TABLE topology.production_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES topology.zones(id) ON DELETE CASCADE,
    name TEXT NOT NULL
);

CREATE TABLE topology.cells (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    production_line_id UUID REFERENCES topology.production_lines(id) ON DELETE CASCADE,
    name TEXT NOT NULL
);

CREATE TABLE topology.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    site_id UUID REFERENCES topology.sites(id) ON DELETE CASCADE,
    parent_asset_id UUID REFERENCES topology.assets(id),
    name TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    criticality TEXT NOT NULL,
    operational_status TEXT NOT NULL,
    lifecycle_status TEXT NOT NULL,
    location JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE topology.machines (
    id UUID PRIMARY KEY REFERENCES topology.assets(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    model TEXT,
    serial_number TEXT
);

CREATE TABLE topology.sensors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES topology.assets(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    unit TEXT,
    metadata JSONB
);

CREATE TABLE topology.actuators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES topology.assets(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT,
    metadata JSONB
);

CREATE TABLE topology.asset_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES topology.assets(id) ON DELETE CASCADE,
    child_id UUID REFERENCES topology.assets(id) ON DELETE CASCADE,
    type TEXT NOT NULL -- feeds, depends_on, located_in, controlled_by, observes, actuates, upstream_of, downstream_of, mirrors, simulates, verifies
);

CREATE TABLE topology.asset_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES topology.assets(id) ON DELETE CASCADE,
    tag TEXT NOT NULL
);

CREATE TABLE topology.topology_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    site_id UUID REFERENCES topology.sites(id) ON DELETE CASCADE,
    version_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE topology.topology_change_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES topology.assets(id),
    event_type TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Migration 003: Identity and Tenancy
-- Purpose: Establish strict multi-tenant boundaries and human/service authority scopes.
-- Dependency: 002_schemas.
-- Tables Created: organizations, profiles, roles, permissions, role_permissions, human_authority_scopes, service_identities, api_keys_metadata, auth_events
-- Risks: Locks out users if role associations fail.
-- Rollback Notes: DROP SCHEMA identity CASCADE;

CREATE TABLE identity.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE identity.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE identity.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL -- owner, admin, engineer, operator, reviewer, auditor, read_only, edge_node_service, agent_service, ingestion_service
);

CREATE TABLE identity.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE identity.role_permissions (
    role_id UUID REFERENCES identity.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES identity.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY(role_id, permission_id)
);

CREATE TABLE identity.organization_members (
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES identity.profiles(id) ON DELETE CASCADE,
    role_id UUID REFERENCES identity.roles(id) ON DELETE CASCADE,
    PRIMARY KEY(organization_id, profile_id)
);

CREATE TABLE identity.human_authority_scopes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES identity.profiles(id) ON DELETE CASCADE,
    scope TEXT NOT NULL,
    max_risk_class INT NOT NULL
);

CREATE TABLE identity.service_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role_id UUID REFERENCES identity.roles(id) ON DELETE CASCADE,
    identity_type TEXT NOT NULL -- edge_node, agent, ingestion
);

CREATE TABLE identity.api_keys_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_identity_id UUID REFERENCES identity.service_identities(id) ON DELETE CASCADE,
    key_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE identity.auth_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

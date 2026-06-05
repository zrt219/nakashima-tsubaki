-- Migration 004: Helper Functions
-- Purpose: Define RLS and access control helper functions.
-- Dependency: 003_identity_tenancy.
-- Tables Created: None.
-- Risks: Security vulnerabilities if logic is flawed.
-- Rollback Notes: DROP FUNCTION IF EXISTS identity.current_org_ids();

CREATE OR REPLACE FUNCTION identity.current_org_ids()
RETURNS UUID[] AS $$
DECLARE
    org_ids UUID[];
BEGIN
    SELECT array_agg(organization_id) INTO org_ids
    FROM identity.organization_members
    WHERE profile_id = auth.uid();
    RETURN COALESCE(org_ids, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION identity.is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN org_id = ANY(identity.current_org_ids());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION identity.has_org_role(org_id UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    has_role BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM identity.organization_members om
        JOIN identity.roles r ON om.role_id = r.id
        WHERE om.organization_id = org_id
        AND om.profile_id = auth.uid()
        AND r.name = role_name
    ) INTO has_role;
    RETURN has_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

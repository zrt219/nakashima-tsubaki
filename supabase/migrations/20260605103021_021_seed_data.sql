-- Migration 021: Seed Data Base
-- Purpose: Inject ZRT Industrial AI Lab tenant structure.
-- Dependency: All.
-- Tables Created: None.
-- Risks: None.
-- Rollback Notes: TRUNCATE identity.organizations CASCADE;

DO $$
DECLARE
    v_org_id UUID;
    v_site_id UUID;
    v_zone_id UUID;
    v_line_id UUID;
    v_cell_id UUID;
    v_asset_id UUID;
BEGIN
    -- Only seed if org doesn't exist
    IF NOT EXISTS (SELECT 1 FROM identity.organizations WHERE name = 'ZRT Industrial AI Lab') THEN
        INSERT INTO identity.organizations (name) VALUES ('ZRT Industrial AI Lab') RETURNING id INTO v_org_id;
        
        -- Roles
        INSERT INTO identity.roles (name) VALUES ('owner'), ('admin'), ('engineer'), ('operator'), ('reviewer'), ('auditor'), ('read_only'), ('edge_node_service'), ('agent_service') ON CONFLICT DO NOTHING;
        
        -- Topology
        INSERT INTO topology.sites (organization_id, name, region) VALUES (v_org_id, 'Nakashima-Tsubaki Precision Cell', 'JP-EAST') RETURNING id INTO v_site_id;
        INSERT INTO topology.zones (organization_id, site_id, name) VALUES (v_org_id, v_site_id, 'Machining Zone A') RETURNING id INTO v_zone_id;
        INSERT INTO topology.production_lines (organization_id, zone_id, name) VALUES (v_org_id, v_zone_id, 'Line 1 - Spindles') RETURNING id INTO v_line_id;
        INSERT INTO topology.cells (organization_id, production_line_id, name) VALUES (v_org_id, v_line_id, 'CNC Multi-Spindle Cell 01') RETURNING id INTO v_cell_id;
        
        -- Asset
        INSERT INTO topology.assets (organization_id, site_id, name, asset_type, criticality, operational_status, lifecycle_status)
        VALUES (v_org_id, v_site_id, 'Spindle Alpha', 'machine', 'high', 'active', 'production') RETURNING id INTO v_asset_id;
        
        -- Sensor
        INSERT INTO topology.sensors (organization_id, asset_id, name, unit)
        VALUES (v_org_id, v_asset_id, 'spindle_speed_rpm', 'RPM'),
               (v_org_id, v_asset_id, 'coolant_temp_c', 'Celsius'),
               (v_org_id, v_asset_id, 'vibration_rms_mm_s', 'mm/s');
    END IF;
END $$;

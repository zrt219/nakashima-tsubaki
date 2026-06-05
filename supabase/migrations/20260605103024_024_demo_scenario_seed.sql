-- Migration 024: Demo Scenario Seed
-- Purpose: Inject the full Nakashima-Tsubaki Thermal Excursion demo flow.
-- Dependency: 021_seed_data, 009_simulation.
-- Tables Created: None.
-- Risks: None.
-- Rollback Notes: DELETE FROM simulation.scenario_templates WHERE name = 'Thermal Excursion';

DO $$
DECLARE
    v_org_id UUID;
BEGIN
    SELECT id INTO v_org_id FROM identity.organizations WHERE name = 'ZRT Industrial AI Lab' LIMIT 1;
    IF v_org_id IS NOT NULL THEN
        -- Add Demo Scenarios
        INSERT INTO simulation.scenario_templates (organization_id, name, type, description)
        VALUES (v_org_id, 'Thermal Excursion', 'anomaly', 'Spindle overheat triggering anomaly and RAG mitigation'),
               (v_org_id, 'Spindle Degradation', 'degradation', 'Long-term vibration increase'),
               (v_org_id, 'Sensor Drift', 'calibration', 'Gradual drift in dimensional QA scores') ON CONFLICT DO NOTHING;
               
        -- Add Demo RAG Docs Metadata (Actual embeddings would be handled by Python script)
        INSERT INTO rag.document_authority_levels (organization_id, level) VALUES (v_org_id, 'approved') ON CONFLICT DO NOTHING;
    END IF;
END $$;

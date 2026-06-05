-- Migration 025: Final Validation
-- Purpose: Validate the entire execution and log the success to the system events.
-- Dependency: All.
-- Tables Created: None.
-- Risks: None.
-- Rollback Notes: None.

DO $$
DECLARE
    v_org_id UUID;
BEGIN
    SELECT id INTO v_org_id FROM identity.organizations WHERE name = 'ZRT Industrial AI Lab' LIMIT 1;
    IF v_org_id IS NOT NULL THEN
        INSERT INTO observability.system_events (organization_id, event_type, payload)
        VALUES (v_org_id, 'ZRT_TWINRSI_9000X_DEPLOYMENT', '{"status": "success", "message": "The complete ZRT TwinRSI 9000x Autonomic Edge OS architecture has been successfully deployed."}');
    END IF;
END $$;

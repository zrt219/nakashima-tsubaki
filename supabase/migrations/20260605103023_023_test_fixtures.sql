-- Migration 023: Test Fixtures
-- Purpose: Setup testing boundaries and dummy eval suites for the RSI improvement cycle.
-- Dependency: 014_rsi.
-- Tables Created: None.
-- Risks: None.
-- Rollback Notes: DELETE FROM rsi.eval_suites WHERE name = 'ZRT Baseline Safety Eval';

DO $$
DECLARE
    v_org_id UUID;
BEGIN
    SELECT id INTO v_org_id FROM identity.organizations WHERE name = 'ZRT Industrial AI Lab' LIMIT 1;
    IF v_org_id IS NOT NULL THEN
        INSERT INTO rsi.eval_suites (organization_id, name, version)
        VALUES (v_org_id, 'ZRT Baseline Safety Eval', '1.0.0') ON CONFLICT DO NOTHING;
    END IF;
END $$;

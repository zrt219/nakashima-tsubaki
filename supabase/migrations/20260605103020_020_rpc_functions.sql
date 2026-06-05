-- Migration 020: RPC Functions
-- Purpose: Provide controlled endpoints for edge ingestion and approvals.
-- Dependency: 006_telemetry_base, 012_governance_provenance.
-- Tables Created: None.
-- Risks: Logic bugs in RPCs.
-- Rollback Notes: DROP FUNCTION IF EXISTS ...

-- 1. Ingest Telemetry Batch
CREATE OR REPLACE FUNCTION telemetry.ingest_telemetry_batch(
    p_org_id UUID,
    p_source_ip TEXT,
    p_events JSONB
) RETURNS UUID AS $$
DECLARE
    v_batch_id UUID;
    v_event JSONB;
BEGIN
    INSERT INTO telemetry.telemetry_batches(organization_id, source_ip, batch_size)
    VALUES (p_org_id, p_source_ip, jsonb_array_length(p_events))
    RETURNING id INTO v_batch_id;
    
    -- In production, process batch efficiently
    -- This is a stub for the RPC signature
    RETURN v_batch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Request Approval
CREATE OR REPLACE FUNCTION governance.request_approval(
    p_org_id UUID,
    p_type TEXT,
    p_risk_class_id UUID,
    p_role TEXT,
    p_recommendation_id UUID
) RETURNS UUID AS $$
DECLARE
    v_request_id UUID;
BEGIN
    INSERT INTO governance.approval_requests(organization_id, request_type, risk_class_id, required_role, requested_by, recommendation_id, status)
    VALUES (p_org_id, p_type, p_risk_class_id, p_role, auth.uid(), p_recommendation_id, 'pending')
    RETURNING id INTO v_request_id;
    
    RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

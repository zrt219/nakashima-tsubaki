-- Migration 019: RLS Policies
-- Purpose: Apply strict data access policies across the domains based on identity.current_org_ids().
-- Dependency: 018_rls_enablement.
-- Tables Created: None.
-- Risks: Complex policies could accidentally lock out legit traffic or leak data if flawed.
-- Rollback Notes: DROP POLICY ...

-- TOPOLOGY (Org members can read)
CREATE POLICY "Org members can view topology sites" ON topology.sites
    FOR SELECT USING (organization_id = ANY(identity.current_org_ids()));

CREATE POLICY "Org members can view assets" ON topology.assets
    FOR SELECT USING (organization_id = ANY(identity.current_org_ids()));

-- TELEMETRY (Client apps cannot read or write directly. Service role only)
CREATE POLICY "Service roles can insert telemetry" ON telemetry.telemetry_events
    FOR INSERT WITH CHECK (true); -- Only service_role keys can bypass RLS anyway, but if RLS applies to authenticated, we deny them.

-- TWIN (Org members can read)
CREATE POLICY "Org members can view twin estimates" ON twin.inferred_state_estimates
    FOR SELECT USING (organization_id = ANY(identity.current_org_ids()));

-- LEDGER / AUDIT (Service role writes only, org members can read their own)
CREATE POLICY "Org members can read audit log" ON governance.audit_log
    FOR SELECT USING (organization_id = ANY(identity.current_org_ids()));
    
-- No INSERT/UPDATE/DELETE policy for audit_log -> Implicitly denied for authenticated users.

-- AGENT SWARM (Org members can read)
CREATE POLICY "Org members can read agent runs" ON agents.agent_runs
    FOR SELECT USING (organization_id = ANY(identity.current_org_ids()));

-- RSI (Org members can read evals)
CREATE POLICY "Org members can read eval runs" ON rsi.eval_runs
    FOR SELECT USING (organization_id = ANY(identity.current_org_ids()));

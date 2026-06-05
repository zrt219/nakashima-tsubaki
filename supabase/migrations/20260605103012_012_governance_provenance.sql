-- Migration 012: Governance, Provenance, and Approval Domain
-- Purpose: Tamper-evident, hash-chained ledger for approvals and audits.
-- Dependency: 003_identity_tenancy, 008_edge_runtime.
-- Tables Created: governance_rules, risk_classes, policy_versions, approval_requests, approval_decisions, audit_log, evidence_artifacts, hash_chain_entries, signed_releases, incident_reports, policy_exceptions, kill_switch_events, manual_override_events, control_boundary_events
-- Risks: None.
-- Rollback Notes: DROP SCHEMA governance CASCADE;

CREATE TABLE governance.governance_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    definition TEXT NOT NULL
);

CREATE TABLE governance.risk_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    max_allowed_edge_risk INT NOT NULL
);

CREATE TABLE governance.policy_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES governance.governance_rules(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE governance.approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL,
    risk_class_id UUID REFERENCES governance.risk_classes(id),
    required_role TEXT NOT NULL,
    requested_by UUID REFERENCES identity.profiles(id),
    recommendation_id UUID, -- References advisory.recommendations
    deadline TIMESTAMPTZ,
    status TEXT NOT NULL,
    requested_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE governance.approval_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    request_id UUID REFERENCES governance.approval_requests(id) ON DELETE CASCADE,
    decision TEXT NOT NULL, -- approved, rejected, more_context_requested, deferred, escalated
    reason TEXT,
    approver_id UUID REFERENCES identity.profiles(id) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE governance.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE governance.evidence_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    storage_path TEXT NOT NULL
);

CREATE TABLE governance.hash_chain_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    record_id UUID NOT NULL,
    previous_hash TEXT,
    current_hash TEXT NOT NULL,
    payload_hash TEXT NOT NULL,
    actor_id UUID NOT NULL,
    actor_type TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE governance.signed_releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    release_notes TEXT,
    signature TEXT NOT NULL,
    released_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE governance.incident_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    severity TEXT NOT NULL,
    description TEXT,
    reported_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE governance.policy_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    policy_version_id UUID REFERENCES governance.policy_versions(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    granted_by UUID REFERENCES identity.profiles(id) NOT NULL,
    valid_until TIMESTAMPTZ
);

CREATE TABLE governance.kill_switch_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    triggered_by UUID REFERENCES identity.profiles(id) NOT NULL,
    reason TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE governance.manual_override_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    operator_id UUID REFERENCES identity.profiles(id) NOT NULL,
    action_taken TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE governance.control_boundary_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    description TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

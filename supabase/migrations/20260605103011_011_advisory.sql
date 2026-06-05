-- Migration 011: Advisory Recommendation Engine Domain
-- Purpose: Governance-checked AI suggestions linked to twin state and evidence.
-- Dependency: 007_twin_base, 010_rag_knowledge.
-- Tables Created: recommendation_requests, recommendations, recommendation_rationales, recommendation_evidence_links, recommendation_risk_scores, recommendation_outcomes, operator_feedback, recommendation_policy_checks
-- Risks: None.
-- Rollback Notes: DROP SCHEMA advisory CASCADE;

CREATE TABLE advisory.recommendation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    context_payload JSONB NOT NULL,
    requested_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE advisory.recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    request_id UUID REFERENCES advisory.recommendation_requests(id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL,
    safety_mode TEXT NOT NULL, -- advisory_only, shadow_mode, approval_required, blocked, evidence_only
    confidence_score NUMERIC NOT NULL,
    risk_class INT NOT NULL,
    human_authority_requirement TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE advisory.recommendation_rationales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    recommendation_id UUID REFERENCES advisory.recommendations(id) ON DELETE CASCADE,
    rationale_text TEXT NOT NULL
);

CREATE TABLE advisory.recommendation_evidence_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    recommendation_id UUID REFERENCES advisory.recommendations(id) ON DELETE CASCADE,
    twin_state_id UUID REFERENCES twin.inferred_state_estimates(id),
    rag_citation_id UUID REFERENCES rag.citation_spans(id)
);

CREATE TABLE advisory.recommendation_risk_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    recommendation_id UUID REFERENCES advisory.recommendations(id) ON DELETE CASCADE,
    risk_factor TEXT NOT NULL,
    score NUMERIC NOT NULL
);

CREATE TABLE advisory.recommendation_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    recommendation_id UUID REFERENCES advisory.recommendations(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    outcome_payload JSONB
);

CREATE TABLE advisory.operator_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    recommendation_id UUID REFERENCES advisory.recommendations(id) ON DELETE CASCADE,
    operator_id UUID REFERENCES identity.profiles(id),
    rating INT,
    feedback_text TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE advisory.recommendation_policy_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    recommendation_id UUID REFERENCES advisory.recommendations(id) ON DELETE CASCADE,
    policy_id UUID, -- Will link to edge.edge_policies
    check_result BOOLEAN NOT NULL,
    checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration 014: RSI Improvement Factory Domain
-- Purpose: Bounded recursive self-improvement lifecycle with eval and safety checks.
-- Dependency: 003_identity_tenancy.
-- Tables Created: improvement_cycles, hypotheses, proposed_changes, change_sets, eval_suites, eval_cases, eval_runs, eval_results, regression_checks, safety_checks, capability_deltas, rsi_readiness_scores, rollback_plans, improvement_memory, release_candidates, release_reviews, accepted_improvements, rejected_improvements
-- Risks: None.
-- Rollback Notes: DROP SCHEMA rsi CASCADE;

CREATE TABLE rsi.improvement_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE rsi.hypotheses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    cycle_id UUID REFERENCES rsi.improvement_cycles(id) ON DELETE CASCADE,
    evidence_cited TEXT NOT NULL,
    proposed_solution TEXT NOT NULL
);

CREATE TABLE rsi.proposed_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    hypothesis_id UUID REFERENCES rsi.hypotheses(id) ON DELETE CASCADE,
    diff_payload TEXT NOT NULL
);

CREATE TABLE rsi.change_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    proposed_change_id UUID REFERENCES rsi.proposed_changes(id) ON DELETE CASCADE,
    status TEXT NOT NULL
);

CREATE TABLE rsi.eval_suites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    version TEXT NOT NULL
);

CREATE TABLE rsi.eval_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    suite_id UUID REFERENCES rsi.eval_suites(id) ON DELETE CASCADE,
    case_definition JSONB NOT NULL
);

CREATE TABLE rsi.eval_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    suite_id UUID REFERENCES rsi.eval_suites(id) ON DELETE CASCADE,
    change_set_id UUID REFERENCES rsi.change_sets(id) ON DELETE CASCADE,
    status TEXT NOT NULL
);

CREATE TABLE rsi.eval_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    run_id UUID REFERENCES rsi.eval_runs(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    score NUMERIC NOT NULL,
    passed BOOLEAN NOT NULL
);

CREATE TABLE rsi.regression_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    run_id UUID REFERENCES rsi.eval_runs(id) ON DELETE CASCADE,
    baseline_score NUMERIC NOT NULL,
    new_score NUMERIC NOT NULL,
    regression_detected BOOLEAN NOT NULL
);

CREATE TABLE rsi.safety_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    run_id UUID REFERENCES rsi.eval_runs(id) ON DELETE CASCADE,
    check_name TEXT NOT NULL,
    passed BOOLEAN NOT NULL
);

CREATE TABLE rsi.capability_deltas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    run_id UUID REFERENCES rsi.eval_runs(id) ON DELETE CASCADE,
    capability TEXT NOT NULL,
    improvement NUMERIC NOT NULL
);

CREATE TABLE rsi.rsi_readiness_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    change_set_id UUID REFERENCES rsi.change_sets(id) ON DELETE CASCADE,
    readiness_score NUMERIC NOT NULL,
    is_ready BOOLEAN NOT NULL
);

CREATE TABLE rsi.rollback_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    change_set_id UUID REFERENCES rsi.change_sets(id) ON DELETE CASCADE,
    rollback_instructions TEXT NOT NULL
);

CREATE TABLE rsi.improvement_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    lane TEXT NOT NULL, -- source_memory, decision_memory, capability_memory, failure_memory, assumption_memory, policy_memory
    content TEXT NOT NULL,
    logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rsi.release_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    change_set_id UUID REFERENCES rsi.change_sets(id) ON DELETE CASCADE,
    status TEXT NOT NULL
);

CREATE TABLE rsi.release_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES rsi.release_candidates(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES identity.profiles(id),
    decision TEXT NOT NULL,
    reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rsi.accepted_improvements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES rsi.release_candidates(id) ON DELETE CASCADE,
    release_version TEXT NOT NULL,
    accepted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rsi.rejected_improvements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES rsi.release_candidates(id) ON DELETE CASCADE,
    rejection_reason TEXT NOT NULL,
    rejected_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration 027: Biomimetic Agent Genomes & Lineages
-- Purpose: Extends the agents domain with Dolphin Pods, Bee Hives, and versioned genomes.

CREATE TABLE agents.agent_families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    family_name TEXT NOT NULL,
    family_type TEXT NOT NULL CHECK (family_type IN ('dolphin_pod', 'bee_hive', 'hybrid')),
    purpose TEXT,
    default_genome_id UUID, -- We'll add FK after genomes table exists
    safety_profile TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    archived_at TIMESTAMPTZ
);

CREATE TABLE agents.agent_genomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    family_id UUID REFERENCES agents.agent_families(id) ON DELETE CASCADE,
    genome_name TEXT NOT NULL,
    genome_version TEXT NOT NULL,
    species_archetype TEXT NOT NULL,
    role TEXT NOT NULL,
    objective_weights JSONB NOT NULL DEFAULT '{"quality": 1, "safety": 1}',
    tools_allowed JSONB NOT NULL DEFAULT '[]',
    memory_lanes_allowed JSONB NOT NULL DEFAULT '[]',
    data_scopes_allowed JSONB NOT NULL DEFAULT '[]',
    autonomy_level TEXT NOT NULL,
    spawn_policy JSONB NOT NULL DEFAULT '{"can_request_children": false}',
    eval_suite_ids UUID[] DEFAULT '{}',
    safety_locks JSONB NOT NULL DEFAULT '{"cannot_self_approve": true}',
    immutable_fields JSONB NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    approved_by UUID REFERENCES identity.profiles(id)
);

ALTER TABLE agents.agent_families 
ADD CONSTRAINT fk_default_genome 
FOREIGN KEY (default_genome_id) REFERENCES agents.agent_genomes(id);

CREATE TABLE agents.agent_lineages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    root_genome_id UUID REFERENCES agents.agent_genomes(id) ON DELETE CASCADE,
    parent_genome_id UUID REFERENCES agents.agent_genomes(id) ON DELETE CASCADE,
    child_genome_id UUID REFERENCES agents.agent_genomes(id) ON DELETE CASCADE,
    mutation_summary TEXT,
    mutation_reason TEXT,
    eval_delta NUMERIC,
    safety_delta NUMERIC,
    approved_by UUID REFERENCES identity.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE agents.agent_fitness_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents.agents(id) ON DELETE CASCADE,
    genome_id UUID REFERENCES agents.agent_genomes(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL,
    success_score NUMERIC NOT NULL,
    evidence_score NUMERIC NOT NULL,
    safety_score NUMERIC NOT NULL,
    speed_score NUMERIC NOT NULL,
    cost_score NUMERIC NOT NULL,
    human_correction_rate NUMERIC,
    eval_pass_rate NUMERIC,
    rollback_rate NUMERIC,
    total_score NUMERIC GENERATED ALWAYS AS (
        (success_score * 0.3) + (evidence_score * 0.2) + (safety_score * 0.4) + (speed_score * 0.1)
    ) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE agents.agent_spawn_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    parent_agent_id UUID REFERENCES agents.agents(id) ON DELETE CASCADE,
    requested_genome_id UUID REFERENCES agents.agent_genomes(id),
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, quarantined
    created_at TIMESTAMPTZ DEFAULT NOW(),
    approved_by UUID REFERENCES identity.profiles(id)
);

CREATE TABLE agents.agent_family_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    family_id UUID REFERENCES agents.agent_families(id) ON DELETE CASCADE,
    memory_type TEXT NOT NULL CHECK (memory_type IN ('pod_memory', 'colony_memory')),
    context_keys TEXT[],
    content JSONB NOT NULL,
    trust_score NUMERIC DEFAULT 0.5,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE agents.agent_collaboration_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    source_agent_id UUID REFERENCES agents.agents(id) ON DELETE CASCADE,
    target_agent_id UUID REFERENCES agents.agents(id) ON DELETE CASCADE,
    signal_protocol TEXT NOT NULL CHECK (signal_protocol IN ('dolphin_echo', 'bee_waggle')),
    signal_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    priority NUMERIC DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Enablement
ALTER TABLE agents.agent_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents.agent_genomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents.agent_lineages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents.agent_fitness_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents.agent_spawn_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents.agent_family_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents.agent_collaboration_edges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Tenant Isolation on agent_families" ON agents.agent_families FOR ALL USING (organization_id = ANY(identity.current_org_ids()));
CREATE POLICY "Tenant Isolation on agent_genomes" ON agents.agent_genomes FOR ALL USING (organization_id = ANY(identity.current_org_ids()));
CREATE POLICY "Tenant Isolation on agent_lineages" ON agents.agent_lineages FOR ALL USING (organization_id = ANY(identity.current_org_ids()));
CREATE POLICY "Tenant Isolation on agent_fitness_scores" ON agents.agent_fitness_scores FOR ALL USING (organization_id = ANY(identity.current_org_ids()));
CREATE POLICY "Tenant Isolation on agent_spawn_requests" ON agents.agent_spawn_requests FOR ALL USING (organization_id = ANY(identity.current_org_ids()));
CREATE POLICY "Tenant Isolation on agent_family_memory" ON agents.agent_family_memory FOR ALL USING (organization_id = ANY(identity.current_org_ids()));
CREATE POLICY "Tenant Isolation on agent_collaboration_edges" ON agents.agent_collaboration_edges FOR ALL USING (organization_id = ANY(identity.current_org_ids()));

-- Indexes for scaling
CREATE INDEX idx_genomes_family ON agents.agent_genomes(family_id);
CREATE INDEX idx_fitness_agent ON agents.agent_fitness_scores(agent_id);
CREATE INDEX idx_fitness_genome ON agents.agent_fitness_scores(genome_id);
CREATE INDEX idx_collab_edges_source ON agents.agent_collaboration_edges(source_agent_id);
CREATE INDEX idx_collab_edges_target ON agents.agent_collaboration_edges(target_agent_id);

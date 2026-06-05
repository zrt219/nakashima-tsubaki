-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Domain 6: Physical Topology (Plant & Fleet)
CREATE TABLE public.facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    timezone TEXT NOT NULL
);

CREATE TABLE public.workcells (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    operational_status TEXT NOT NULL
);

CREATE TABLE public.equipment_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workcell_id UUID REFERENCES public.workcells(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    model TEXT NOT NULL,
    serial_number TEXT NOT NULL,
    install_date DATE
);

-- Domain 1: Twin Execution (Core Simulator)
CREATE TABLE public.scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    model_id TEXT NOT NULL,
    difficulty TEXT,
    risk_level TEXT
);

CREATE TABLE public.simulation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID REFERENCES public.scenarios(id) ON DELETE CASCADE,
    current_step TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.simulator_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID REFERENCES public.simulation_runs(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    state TEXT NOT NULL,
    actor TEXT NOT NULL,
    summary TEXT,
    evidence_hash TEXT
);

-- Domain 2: High-Frequency Telemetry (Signals)
CREATE TABLE public.equipment_sensors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID REFERENCES public.equipment_assets(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    unit TEXT NOT NULL,
    baseline NUMERIC,
    threshold NUMERIC
);

CREATE TABLE public.telemetry_timeseries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id UUID REFERENCES public.equipment_sensors(id) ON DELETE CASCADE,
    run_id UUID REFERENCES public.simulation_runs(id) ON DELETE CASCADE,
    reading NUMERIC NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.anomaly_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id UUID REFERENCES public.equipment_sensors(id) ON DELETE CASCADE,
    run_id UUID REFERENCES public.simulation_runs(id) ON DELETE CASCADE,
    severity TEXT NOT NULL,
    detected_at TIMESTAMPTZ DEFAULT NOW()
);

-- Domain 3: Governance & Provenance (Ledger)
CREATE TABLE public.approval_gates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID REFERENCES public.simulation_runs(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    required_role TEXT NOT NULL,
    reason TEXT,
    status TEXT NOT NULL,
    resolved_at TIMESTAMPTZ,
    resolved_by TEXT
);

CREATE TABLE public.evidence_packets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID REFERENCES public.simulation_runs(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL,
    title TEXT NOT NULL,
    confidence NUMERIC,
    payload_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.operator_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id TEXT NOT NULL,
    action TEXT NOT NULL,
    target_table TEXT,
    record_id UUID,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Domain 4: Cognitive RAG (Knowledge)
CREATE TABLE public.knowledge_corpus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    source_url TEXT,
    chunk_index INT
);

CREATE TABLE public.retrieval_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID REFERENCES public.simulation_runs(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    top_k_results INT,
    generated_summary TEXT,
    latency_ms INT
);

-- Domain 5: Agent Swarm Orchestration
CREATE TABLE public.swarm_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    role TEXT NOT NULL,
    system_prompt TEXT,
    model TEXT NOT NULL
);

CREATE TABLE public.agent_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID REFERENCES public.simulation_runs(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.swarm_agents(id) ON DELETE CASCADE,
    input_context TEXT,
    action_taken TEXT,
    confidence NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

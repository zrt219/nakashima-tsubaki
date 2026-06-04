create schema if not exists simulation;

create table if not exists simulation.runs (
  id text primary key,
  scenario_name text not null,
  current_step text not null,
  risk_level text not null,
  lot_id text not null,
  line_id text not null,
  scenario_input jsonb not null,
  recommendation jsonb not null,
  decision jsonb,
  evidence_packet jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists simulation.run_events (
  id text primary key,
  run_id text not null references simulation.runs(id) on delete cascade,
  source text not null,
  event text not null,
  payload text not null,
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists simulation.approvals (
  id bigint generated always as identity primary key,
  run_id text not null references simulation.runs(id) on delete cascade,
  verdict text not null,
  reviewer text not null,
  note text not null,
  decided_at timestamptz not null
);

create table if not exists simulation.evidence_packets (
  id text primary key,
  run_id text not null references simulation.runs(id) on delete cascade,
  evidence_hash text not null,
  summary text not null,
  categories jsonb not null,
  payload jsonb not null,
  generated_at timestamptz not null
);

create table if not exists simulation.knowledge_documents (
  id text primary key,
  title text not null,
  owner text not null,
  document_type text not null,
  snippet text not null,
  tags jsonb not null,
  control_area text not null,
  created_at timestamptz not null default now()
);

create index if not exists simulation_runs_updated_at_idx
  on simulation.runs (updated_at desc);

create index if not exists simulation_run_events_run_id_idx
  on simulation.run_events (run_id, created_at asc);

create index if not exists simulation_approvals_run_id_idx
  on simulation.approvals (run_id);

create index if not exists simulation_evidence_packets_run_id_idx
  on simulation.evidence_packets (run_id);

alter table simulation.runs enable row level security;
alter table simulation.run_events enable row level security;
alter table simulation.approvals enable row level security;
alter table simulation.evidence_packets enable row level security;
alter table simulation.knowledge_documents enable row level security;

insert into simulation.knowledge_documents (id, title, owner, document_type, snippet, tags, control_area)
values
  (
    'SRC-QMS-014',
    'Grinding line quality escape review',
    'Quality Engineering',
    'QMS procedure',
    'Requires lot hold, inspection sample expansion, root-cause note, and operator signoff before any controlled release.',
    '["quality", "lot hold", "surface finish", "approval"]'::jsonb,
    'Containment and release'
  ),
  (
    'SRC-MNT-221',
    'Spindle vibration advisory threshold',
    'Maintenance Reliability',
    'CMMS bulletin',
    'Trend-based inspection should be scheduled when normalized vibration crosses the advisory band for two cycles.',
    '["maintenance", "vibration", "spindle", "advisory"]'::jsonb,
    'Condition-based maintenance'
  ),
  (
    'SRC-ENG-088',
    'Bearing surface finish process window',
    'Manufacturing Engineering',
    'Engineering standard',
    'Surface finish deviations require process parameter review, lab verification, and controlled release notes.',
    '["engineering", "surface finish", "process", "verification"]'::jsonb,
    'Process window'
  ),
  (
    'SRC-LAB-041',
    'Metrology sample expansion protocol',
    'Metrology Lab',
    'Lab work instruction',
    'When surface finish drift is confirmed, expand sampling to adjacent lots and record lot genealogy links in the evidence packet.',
    '["metrology", "sample expansion", "lot genealogy", "quality"]'::jsonb,
    'Sample expansion'
  ),
  (
    'SRC-CMP-032',
    'Model-assisted decision audit requirements',
    'Compliance',
    'Audit control',
    'AI recommendations must include source list, confidence band, reviewer identity, and immutable evidence hash.',
    '["compliance", "model decision", "audit", "evidence"]'::jsonb,
    'Decision traceability'
  ),
  (
    'SRC-QMS-119',
    'Controlled release escalation matrix',
    'Quality Operations',
    'Escalation guide',
    'Escalate to engineering board when containment is incomplete, Cpk remains below threshold, or root cause is unresolved.',
    '["controlled release", "escalation", "cpk", "engineering board"]'::jsonb,
    'Escalation'
  )
on conflict (id) do update
set
  title = excluded.title,
  owner = excluded.owner,
  document_type = excluded.document_type,
  snippet = excluded.snippet,
  tags = excluded.tags,
  control_area = excluded.control_area;

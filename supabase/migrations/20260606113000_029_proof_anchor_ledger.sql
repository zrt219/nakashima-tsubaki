-- Proof ledger persistence for evidence anchoring.
-- Safe-by-default: hashed evidence only, off-chain data model for application control.

create schema if not exists proof;

create extension if not exists pgcrypto;

create table if not exists proof.anchors (
  id uuid primary key default gen_random_uuid(),
  run_id text not null,
  scenario_id text,
  event_id text,
  proof_mode text not null,
  network text not null,
  evidence_hash text not null,
  evidence_bytes32 text,
  anchor_type text not null,
  transaction_hash text,
  ledger_index bigint,
  block_number bigint,
  contract_address text,
  wallet_address text,
  explorer_url text,
  status text not null default 'pending',
  error_message text,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create index if not exists proof_anchors_run_id_idx on proof.anchors(run_id);
create index if not exists proof_anchors_hash_idx on proof.anchors(evidence_hash);
create index if not exists proof_anchors_tx_idx on proof.anchors(transaction_hash);
create index if not exists proof_anchors_status_idx on proof.anchors(status);

alter table proof.anchors enable row level security;

drop policy if exists "Authenticated users can read proof summaries" on proof.anchors;
create policy "Authenticated users can read proof summaries"
  on proof.anchors
  for select
  to authenticated
  using (true);

drop policy if exists "Service role can insert proof anchors" on proof.anchors;
create policy "Service role can insert proof anchors"
  on proof.anchors
  for insert
  to service_role
  with check (true);

drop policy if exists "Service role can update proof anchors" on proof.anchors;
create policy "Service role can update proof anchors"
  on proof.anchors
  for update
  to service_role
  using (true)
  with check (true);

drop policy if exists "Service role can delete proof anchors" on proof.anchors;
create policy "Service role can delete proof anchors"
  on proof.anchors
  for delete
  to service_role
  using (true);

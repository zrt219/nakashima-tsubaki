-- Migration 016: Storage Metadata
-- Purpose: Create buckets and metadata tracking for evidence, replays, and docs.
-- Dependency: None directly, requires Supabase storage extension.
-- Tables Created: None (manipulates storage schema).
-- Risks: If storage API is not enabled, this might fail on vanilla postgres.
-- Rollback Notes: DELETE FROM storage.buckets WHERE id IN ('evidence-artifacts', 'simulation-outputs', 'replay-packets', 'qa-reports', 'agent-run-artifacts', 'rsi-release-bundles', 'telemetry-raw-dumps', 'topology-assets', 'knowledge-source-docs', 'audit-exports');

INSERT INTO storage.buckets (id, name, public) VALUES
('evidence-artifacts', 'evidence-artifacts', false),
('simulation-outputs', 'simulation-outputs', false),
('replay-packets', 'replay-packets', false),
('qa-reports', 'qa-reports', false),
('agent-run-artifacts', 'agent-run-artifacts', false),
('rsi-release-bundles', 'rsi-release-bundles', false),
('telemetry-raw-dumps', 'telemetry-raw-dumps', false),
('topology-assets', 'topology-assets', false),
('knowledge-source-docs', 'knowledge-source-docs', false),
('audit-exports', 'audit-exports', false)
ON CONFLICT (id) DO NOTHING;

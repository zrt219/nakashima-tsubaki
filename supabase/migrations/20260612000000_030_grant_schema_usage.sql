-- Migration 030: Grant schema usage to web roles
-- Purpose: Grant USAGE on custom schemas to anon and authenticated roles so the API can access them.

GRANT USAGE ON SCHEMA topology TO anon, authenticated;
GRANT USAGE ON SCHEMA telemetry TO anon, authenticated;
GRANT USAGE ON SCHEMA twin TO anon, authenticated;
GRANT USAGE ON SCHEMA simulation TO anon, authenticated;
GRANT USAGE ON SCHEMA rag TO anon, authenticated;
GRANT USAGE ON SCHEMA advisory TO anon, authenticated;
GRANT USAGE ON SCHEMA governance TO anon, authenticated;
GRANT USAGE ON SCHEMA agents TO anon, authenticated;
GRANT USAGE ON SCHEMA rsi TO anon, authenticated;
GRANT USAGE ON SCHEMA observability TO anon, authenticated;
GRANT USAGE ON SCHEMA proof TO anon, authenticated;

-- Also need to grant SELECT on tables for anon/authenticated, or rely on RLS.
-- Since RLS is enabled on all these tables, we still need to GRANT SELECT, INSERT, UPDATE, DELETE on all tables in these schemas to the roles.
-- Let's grant all privileges on all tables in these schemas to anon and authenticated. The actual security is handled by RLS.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA topology TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA topology GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA telemetry TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA telemetry GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA twin TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA twin GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA simulation TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA simulation GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA rag TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA rag GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA advisory TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA advisory GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA governance TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA governance GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA agents TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA agents GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA rsi TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA rsi GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA observability TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA observability GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA proof TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA proof GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;

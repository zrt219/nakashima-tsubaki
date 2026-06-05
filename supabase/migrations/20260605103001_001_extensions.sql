-- Migration 001: Extensions
-- Purpose: Enable required PostgreSQL extensions for the 9000x architecture.
-- Dependency: None.
-- Tables Created: None.
-- Risks: Minimal. Fails if extensions are not available on the PostgreSQL cluster.
-- Rollback Notes: DROP EXTENSION IF EXISTS "uuid-ossp"; DROP EXTENSION IF EXISTS vector; DROP EXTENSION IF EXISTS pgcrypto;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";
-- pg_stat_statements is typically enabled via Supabase dashboard/settings, but we can try
-- CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

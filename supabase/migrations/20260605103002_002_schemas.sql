-- Migration 002: Schemas
-- Purpose: Define the 12 core domains of the ZRT TwinRSI architecture. Also cleans up the old V1 schemas.
-- Dependency: 001_extensions.
-- Tables Created: None.
-- Risks: DROPs old schemas CASCADE. Data loss for old V1 tables. (Acceptable for this phase).
-- Rollback Notes: DROP SCHEMA identity, topology, telemetry, twin, edge, simulation, rag, advisory, governance, agents, rsi, observability CASCADE;

-- Cleanup old schemas
DROP SCHEMA IF EXISTS topology CASCADE;
DROP SCHEMA IF EXISTS telemetry CASCADE;
DROP SCHEMA IF EXISTS twin CASCADE;
DROP SCHEMA IF EXISTS edge CASCADE;
DROP SCHEMA IF EXISTS ledger CASCADE;
DROP SCHEMA IF EXISTS knowledge CASCADE;
DROP SCHEMA IF EXISTS swarm CASCADE;
DROP SCHEMA IF EXISTS rsi CASCADE;

-- Create the 12 requested schemas
CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS topology;
CREATE SCHEMA IF NOT EXISTS telemetry;
CREATE SCHEMA IF NOT EXISTS twin;
CREATE SCHEMA IF NOT EXISTS edge;
CREATE SCHEMA IF NOT EXISTS simulation;
CREATE SCHEMA IF NOT EXISTS rag;
CREATE SCHEMA IF NOT EXISTS advisory;
CREATE SCHEMA IF NOT EXISTS governance;
CREATE SCHEMA IF NOT EXISTS agents;
CREATE SCHEMA IF NOT EXISTS rsi;
CREATE SCHEMA IF NOT EXISTS observability;
CREATE SCHEMA IF NOT EXISTS private;

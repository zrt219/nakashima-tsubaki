-- Migration 010: RAG / SOP / Evidence Knowledge Domain
-- Purpose: Vectorized ground truth for AI recommendations via pgvector.
-- Dependency: 002_schemas.
-- Tables Created: knowledge_documents, document_versions, knowledge_chunks, chunk_embeddings, document_authority_levels, retrieval_queries, retrieval_results, citation_spans, knowledge_claims, unresolved_assumptions, stale_document_flags, source_ingestion_events, source_validation_events
-- Risks: Vector similarity limits at high scale without proper HNSW indexes.
-- Rollback Notes: DROP SCHEMA rag CASCADE;

CREATE TABLE rag.document_authority_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    level TEXT UNIQUE NOT NULL -- approved, draft, imported, unverified, deprecated, superseded, rejected
);

CREATE TABLE rag.knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    source_type TEXT NOT NULL, -- SOP, maintenance_manual, QA_procedure, governance_policy, etc.
    authority_id UUID REFERENCES rag.document_authority_levels(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rag.document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    document_id UUID REFERENCES rag.knowledge_documents(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rag.knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    document_version_id UUID REFERENCES rag.document_versions(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    chunk_hash TEXT NOT NULL
);

CREATE TABLE rag.chunk_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    chunk_id UUID REFERENCES rag.knowledge_chunks(id) ON DELETE CASCADE,
    embedding vector(1536),
    embedding_model TEXT,
    embedding_dimensions INT
);

CREATE TABLE rag.retrieval_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    embedding_model TEXT,
    filters JSONB,
    missing_context_flag BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rag.retrieval_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    query_id UUID REFERENCES rag.retrieval_queries(id) ON DELETE CASCADE,
    chunk_id UUID REFERENCES rag.knowledge_chunks(id) ON DELETE CASCADE,
    similarity_score NUMERIC NOT NULL
);

CREATE TABLE rag.citation_spans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    result_id UUID REFERENCES rag.retrieval_results(id) ON DELETE CASCADE,
    span_text TEXT NOT NULL
);

CREATE TABLE rag.knowledge_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    claim TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE
);

CREATE TABLE rag.unresolved_assumptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    assumption TEXT NOT NULL,
    logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rag.stale_document_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    document_id UUID REFERENCES rag.knowledge_documents(id) ON DELETE CASCADE,
    flagged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rag.source_ingestion_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    document_id UUID REFERENCES rag.knowledge_documents(id),
    status TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rag.source_validation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES identity.organizations(id) ON DELETE CASCADE,
    document_id UUID REFERENCES rag.knowledge_documents(id) ON DELETE CASCADE,
    validation_status TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

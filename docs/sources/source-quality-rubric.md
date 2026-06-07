# Source Quality Rubric

Checked: 2026-06-07

## Source tiers

- **A**: Official docs, government standards, and protocol specifications used for implementation behavior and safety constraints.
- **B**: Reputable technical references, including peer-reviewed research and strong industry references, for design framing, benchmarks, and risk models.
- **C**: Tutorials, explainers, and community sources for implementation patterns and adjacent context.
- **D**: Weak, promotional, or uncertain sources; use only for context and never for safety or implementation claims.

## Core claims vs context

- Use **A** for implementation-level claims in README (tooling, auth, transport, safety boundaries, env vars, and behavior).
- Use **A + strong B** for architecture direction where standards and protocols are part of the evidence chain.
- Use **B** for benchmark framing, maturity references, and design tradeoff claims.
- Use **C/D** only for adjacent context, examples, and non-authoritative background.

## Preprints and arXiv

- Treat arXiv and preprint material as **B**.
- Do not let preprints become the sole evidence for hard production behavior.
- Pair preprints with A when possible before using them as claim-critical.

## Marketing pages and company blogs

- Use company engineering blogs for roadmap and ecosystem context.
- Do not use marketing pages for protocol correctness, security guarantees, or safety assumptions.
- Prefer official docs/specs when claims involve runtime, cryptography, protocol semantics, or compliance constraints.

## News and secondary reports

- Use news sources only for trend context and ecosystem timeline.
- Do not use news for compliance, protocol, or safety guarantees.
- If a claim relies on a news item, flag it explicitly in claim notes as provisional context.

## Outdated or version-sensitive docs

- Flag sources with dated URLs or evolving specs as version-sensitive.
- Prefer the most recent reference pages and list revision sensitivity in limitations.
- Use explicit notes such as "may vary by environment / release" for any version-sensitive behavior.

## Evidence hygiene checks required for final handoff

- Schema check: `id`, `title`, `url`, `publisher`, `sourceType`, `category`, `claimSupported`, `howUsedInProject`, `reliabilityTier`, `limitations`, `checkedAt`.
- Uniqueness check: no duplicate `SRC-` identifiers.
- Category count check: all required minima met for all required categories.
- Spot-check reachability: representative URLs per category in a constrained way (HEAD/GET where possible) and record uncertainty.

## Citing in README

- Cite core technical claims indirectly through the claim matrix and source library links.
- Do not list all 300+ sources in README.
- Link to `docs/sources/SOURCES_300PLUS.md`, `docs/sources/source-catalog.json`, and `docs/sources/source-claim-matrix.md`.

## Citation laundering safeguards

- A chain of evidence must point directly from each claim to source IDs in the matrix.
- Do not import claim support through unrelated sources.
- Remove weak or unrelated links from claim support when they are only trend or analogy references.
- Do not use the same source to support unrelated claims without explicit note.
- Validate `source-claim-matrix.md` before any README edits.
- Keep core claims in A/B space; reject claim mappings with C/D for core architecture/safety assertions unless clearly marked context-only.
- If a source is downgraded due spot-check failures or quality uncertainty, mark it as context-only in `source-gaps.md` and remove it from core claim mappings before final handoff.

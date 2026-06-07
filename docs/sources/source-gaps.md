# Source Gaps

Generated: 2026-06-07

- Category minima were re-validated against `docs/sources/source-catalog.json` and all required quotas are met.
  - Catalog total: 540 entries (over 300+ requirement).
  - Core category minima are met for all 11 required categories.
- `docs/sources/source-audit-report.json` remains valid for schema checks, duplicate IDs, and required-field presence.
- Representative URL checks for 3 sources per category were re-run during this audit:
  - In the 2026-06-07 environment run, all sampled URL checks returned `ERR` from `Invoke-WebRequest -Method Head` due outbound connectivity constraints.
  - This means browser-aware or later authenticated checks are still required before publication, and those sources are not promoted.
- No core claim source IDs were removed in this pass; core claims remain mapped to A/B-tier entries.
- No C/D sources are required for core claims.
- Remaining verification gaps:
  - Manual browser-aware checks for DOI/research portals and redirect targets are still required before public release.
  - `docs/HANDOFF_REPORT.md` is updated to reflect unresolved environment-level URL reachability and build/font constraints.
  - If a URL remains unreachable at final destination, downgrade it to context-only and remove it from core-claim mappings.

# Handoff report for public launch

## 1. Current app status

- README and source documentation package are expanded for public-ready handoff.
- A source-grounded reference stack is included in `docs/sources`.
- Launch and demo materials are prepared under `docs/launch`.
- Offline-safe font fallbacks are now used in the app shell, so production builds no longer depend on Google font fetches.
- The Next config warning path was cleaned up by removing the invalid top-level `eslint` key.
- A fresh verification run was completed on 2026-06-07 and the build/typecheck/lint/smoke commands are now green, with lint warnings only.

## 2. Live URL

- https://tsubaki-nakashima-ai-zrt.vercel.app/

## 2b. Date anchor

- Evidence date: 2026-06-07 (local checks executed in this environment).

## 3. Routes implemented

- `/` (home)
- `/iot-maker`
- `/source`
- `/tutorials`
- `/logs`

## 4. Core modules implemented

- Reflex loop and operator-gated execution path.
- Query labs and provider selector paths.
- Evidence packet generation and proof anchoring placeholders.
- Source page and documentation system.

## 5. What works in Demo Mode

- 5-second reflex loop visuals and fixed sequence.
- Operator-gated action path with mocked/trace outputs.
- Evidence packet generation (mock-first).
- Dashboard/log event rendering.
- Source page routing and library browsing.

## 6. What requires env vars

- Supabase-backed simulation/history depends on `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- Provider demos require provider keys (`OPENAI_API_KEY`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `LLAMA_API_KEY`).
- AWS IoT bridge mode depends on `AWS_IOT_ENDPOINT` and related AWS/IoT env vars.
- Proof workflow requires proof and chain settings (`XRPL_*`, `HEDERA_*`).

## 7. What is mock-only

- IoT command dispatch is simulated by default.
- Proof anchoring is hash-first and simulation-oriented unless explicit environment and chain keys are provided.
- No direct raw telemetry or tool payloads are written to blockchain in default mode.

## 8. What is connected-ready

- Supabase + AWS IoT surfaces include explicit environment-driven connection points.
- Proof integration paths are structured for testnet/API configuration, with safeguards and approval gates.
- Source/library pages are ready for reviewer validation without external secrets.

## 9. Safety boundaries

- No raw telemetry or prompts on-chain.
- Operator approval is required before dispatch simulation actions.
- No direct PLC write tool is enabled in command surface.
- Secrets are expected to remain server-side.

## 10. Source library status

- `docs/sources/source-catalog.json` includes 540 sources (valid schema, unique IDs, URL format, and checkedAt checks passed).
- `docs/sources/SOURCES_300PLUS.md` includes category coverage for all required source categories.
- `docs/sources/source-claim-matrix.md` includes CLAIM-001 through CLAIM-010.
- `docs/sources/source-quality-rubric.md` and `docs/sources/source-gaps.md` are present.
- `docs/sources/source-audit-report.json` was generated and now verifies:
  - no missing required schema fields
  - no duplicate IDs
  - no category minima shortfalls
  - no malformed `checkedAt` values
- Representative URL spot-check (3 per category) was re-run with `Invoke-WebRequest -Method Head`:
  - Current environment returned `ERR` for all sampled URLs, consistent with restricted outbound connectivity in this session.
  - No source removals were performed because reachability could not be proven in this environment; unresolved URL checks are documented in `docs/sources/source-gaps.md`.
  - Core claims continue to use A/B-tier evidence only.

## 11. Build/lint/test status

- `npm run build` — passed. The build no longer depends on Google font fetches. Next.js still emits non-blocking `themeColor` metadata warnings for several routes.
- `npm run lint` — passed with `0 errors` and `27 warnings`.
- Warning set is now limited to low-priority cleanup items such as unused imports/locals in older dashboards, simulator helpers, and one AWS Lambda handler.
- `npm run typecheck` — passed.
- `node scripts/simulate-live-data.js`:
  - With `IOT_SIM_DRY_RUN=1`, `IOT_SIM_MAX_TICKS=2`, `IOT_SIM_LOG_EVERY=1`, two telemetry ticks were generated successfully.
  - Dry-run mode skipped database reads and writes as intended.
- `node scripts/aws-iot-bridge.js` — exits cleanly with `Skipping AWS IoT connection: AWS_IOT_ENDPOINT not set in .env.local`.

## 12. Known issues

- `npm run lint` still reports warnings only, mostly unused imports/locals in older dashboard and helper files.
- Next.js build emits non-blocking `themeColor` metadata warnings for multiple routes.
- `node scripts/simulate-live-data.js` still requires credentials for connected mode; in mock mode (`IOT_SIM_DRY_RUN=1`) it can run without Supabase credentials.
- `node scripts/aws-iot-bridge.js` requires valid AWS endpoint and optional Supabase role key for end-to-end bridge mode.
- Representative URL spot-checks include redirect-heavy and portal-restricted targets; final landing pages should be browser-validated before publication.
- AWS bridge and simulator scripts also depend on valid AWS credentials and environment files for connected behavior.


## 13. Next engineering tasks

- Optional: prune the remaining low-priority lint warnings if the repo needs a warning-clean release artifact.
- Optional: remove the non-blocking `themeColor` metadata warnings by moving metadata colors to route viewport exports.
- Capture route screenshots for `/`, `/iot-maker`, `/source`, `/tutorials`, `/logs`.
- Re-run URL spot-check using browser-aware checks if required by release policy.

## 14. Recommended launch checklist

- Verify all required source files exist and links resolve.
- Capture route screenshots for `/`, `/iot-maker`, `/source`, `/tutorials`, `/logs`.
- Keep the final build/lint/typecheck baseline: build green, typecheck green, lint green with warnings only.
- Re-run URL spot-check using browser-aware checks if required by release policy.
- Publish launch post variants and demo walkthrough script.
- Attach `docs/HANDOFF_REPORT.md` as source-of-truth handoff artifact.

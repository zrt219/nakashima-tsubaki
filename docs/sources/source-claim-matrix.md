# Source Claim Matrix

## Purpose

Ground the project claims in verifiable evidence from `docs/sources/source-catalog.json`.

| Claim ID | Claim | Source IDs | Source tier | README section | Confidence | Notes |
|---|---|---|---|---|---|---|
| CLAIM-001 | Modern model APIs support structured tool/function calling across major providers. | SRC-0013; SRC-0014; SRC-0008; SRC-0032; SRC-0040 | A | 3,7,14 | High | OpenAI, Gemini, and Claude docs define structured tool-call formats and call arguments. |
| CLAIM-002 | MCP standardizes secure tool access and transport/client patterns for agent workflows. | SRC-0072; SRC-0071; SRC-0069; SRC-0074; SRC-0053 | A | 5,7,13 | High | MCP specification, server/client docs, and security guidance provide implementation framing for tool surfaces. |
| CLAIM-003 | Multi-agent systems are increasingly evaluated with explicit benchmarks and longer horizon workflow measures. | SRC-0119; SRC-0095; SRC-0141; SRC-0094 | B | 3 | Medium | Source mix includes benchmark definitions and agent-evaluation research; strongest core claims should be kept at system behavior level. |
| CLAIM-004 | Supabase and PostgreSQL RLS must be configured before exposing row-level writes. | SRC-0300; SRC-0296; SRC-0289; SRC-0299 | A | 4,6,14 | High | Official guidance supports row-level policies and role separation for privileged operations. |
| CLAIM-005 | AWS IoT supports MQTT + topic-based workflows plus secure broker and command policies. | SRC-0213; SRC-0215; SRC-0219; SRC-0214; SRC-0242 | A | 5,10,16 | High | AWS IoT docs directly cover MQTT, device shadows, rule/telemetry flow, and auth boundaries. |
| CLAIM-006 | XRPL transactions can carry metadata constraints suitable for memo-style anchoring patterns. | SRC-0398; SRC-0397 | A | 10 | Medium | XRPL transaction docs cover transaction fields and memo concepts; implementation constraints should be treated as protocol-version-sensitive. |
| CLAIM-007 | Hedera Testnet supports EVM-style JSON-RPC access with documented chain/network settings. | SRC-0347; SRC-0366; SRC-0368 | A | 10,11 | Medium | Official docs plus MetaMask setup docs provide network and chain-ID operational details for testnet integration. |
| CLAIM-008 | Proof layers should anchor hashes only and avoid operational secrets. | SRC-0398; SRC-0397; SRC-0365; SRC-0384; SRC-0375 | A | 10,11,14 | High | Transaction hash/event patterns and smart-contract tooling are suitable for immutable proofs only when explicit payload minimization is enforced. |
| CLAIM-009 | Digital twins are relevant to CPS and modern manufacturing workflows. | SRC-0199; SRC-0201; SRC-0160; SRC-0151; SRC-0181; SRC-0183; SRC-0192 | A/B | 6,10,12 | High | Official ISO/NIST references and manufacturing digital-twin research align with the prototype's scope framing. |
| CLAIM-010 | Operator-gated automation is safer than direct autonomous machine-control actuation. | SRC-0428; SRC-0436; SRC-0435; SRC-0443; SRC-0433 | A/B | 14,17,18 | High | Governance/AI RMF and OWASP guidance supports approval boundaries and injection-risk controls for production transitions. |

## Notes

- Keep all high-stakes README architecture claims linked to A or strong B sources.
- Promote sources in C/D to context-only use unless later corroborated by implementation docs.

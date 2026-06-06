"use client";

import { Panel } from "@/components/tn-command-center/command-center-primitives";

const setupSnippet = `# Multi-Chain Proof Ledger bootstrap
DATA_MODE=mock
IOT_MODE=mock
AI_PROVIDER=mock
PROOF_MODE=mock

AWS_REGION=
AWS_IOT_ENDPOINT=
AWS_IOT_CLIENT_ID=tn-ai-demo
AWS_IOT_TOPIC_TELEMETRY=tn-ai/demo/telemetry
AWS_IOT_TOPIC_COMMANDS=tn-ai/demo/commands

GEMINI_API_KEY=
OPENAI_API_KEY=

XRPL_TESTNET_WS=wss://s.altnet.rippletest.net:51233/
XRPL_TESTNET_JSON_RPC=https://s.altnet.rippletest.net:51234/
XRPL_ANCHOR_SEED=
XRPL_PROOF_DESTINATION=

HEDERA_EVM_CHAIN_ID=296
HEDERA_EVM_RPC_URL=https://testnet.hashio.io/api
HEDERA_EVM_PRIVATE_KEY=
HEDERA_PROOF_LEDGER_CONTRACT_ADDRESS=

REQUIRE_OPERATOR_APPROVAL=true
ALLOW_DIRECT_MACHINE_CONTROL=false`;

export function SetupExportPanel() {
  return (
    <Panel title="Setup Export" kicker="Portable environment snapshot" icon="database" accent="cyan">
      <p className="mb-3 text-sm text-slate-300">
        Copy these values to local `.env` for predictable startup. `PROOF_MODE=mock` works immediately.
      </p>
      <pre className="overflow-x-auto border border-cyan-900/60 bg-black/60 p-3 text-[11px] text-cyan-200">
        {setupSnippet}
      </pre>
      <p className="mt-3 text-xs text-amber-300">
        Testnet modes remain simulation-only proof anchoring by design. Blockchain never dispatches commands.
      </p>
    </Panel>
  );
}

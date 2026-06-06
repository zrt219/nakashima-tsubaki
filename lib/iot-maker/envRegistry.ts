// lib/iot-maker/envRegistry.ts
// Server-only. Never import from client components.

export type EnvEntry = {
  key: string;
  present: boolean;
  masked: string;
  required: "demo" | "connected" | "optional";
  serverOnly: boolean;
  description: string;
};

function maskValue(val: string | undefined): string {
  if (!val) return "(not set)";
  if (val.length <= 6) return "****";
  return val.slice(0, 3) + "****" + val.slice(-2);
}

function isPresent(key: string): boolean {
  return !!process.env[key] && process.env[key]!.trim() !== "";
}

export function buildEnvRegistry(): EnvEntry[] {
  return [
    {
      key: "DATA_MODE",
      present: isPresent("DATA_MODE"),
      masked: "(server-only: UI-only visibility)",
      required: "optional",
      serverOnly: false,
      description: "Set mock or connected behavior."
    },
    {
      key: "IOT_MODE",
      present: isPresent("IOT_MODE"),
      masked: "(server-only: UI-only visibility)",
      required: "optional",
      serverOnly: false,
      description: "Set demo/mock or connected behavior."
    },
    {
      key: "AI_PROVIDER",
      present: isPresent("AI_PROVIDER"),
      masked: maskValue(process.env.AI_PROVIDER),
      required: "optional",
      serverOnly: false,
      description: "mock | gemini | openai"
    },
    {
      key: "PROOF_MODE",
      present: isPresent("PROOF_MODE"),
      masked: maskValue(process.env.PROOF_MODE),
      required: "optional",
      serverOnly: false,
      description: "Proof mode: mock | xrpl_testnet | hedera_testnet | disabled"
    },
    { key: "NEXT_PUBLIC_SUPABASE_URL", present: isPresent("NEXT_PUBLIC_SUPABASE_URL"), masked: maskValue(process.env.NEXT_PUBLIC_SUPABASE_URL), required: "connected", serverOnly: false, description: "Supabase project URL" },
    { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", present: isPresent("NEXT_PUBLIC_SUPABASE_ANON_KEY"), masked: maskValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY), required: "connected", serverOnly: false, description: "Supabase anon key (safe)" },
    { key: "SUPABASE_SERVICE_ROLE_KEY", present: isPresent("SUPABASE_SERVICE_ROLE_KEY"), masked: "(server-only, never exposed)", required: "connected", serverOnly: true, description: "Supabase service role key (server-only)" },
    { key: "AWS_REGION", present: isPresent("AWS_REGION"), masked: maskValue(process.env.AWS_REGION), required: "connected", serverOnly: true, description: "AWS region for IoT Core" },
    { key: "AWS_IOT_ENDPOINT", present: isPresent("AWS_IOT_ENDPOINT"), masked: maskValue(process.env.AWS_IOT_ENDPOINT), required: "connected", serverOnly: true, description: "AWS IoT Core endpoint" },
    { key: "AWS_IOT_CLIENT_ID", present: isPresent("AWS_IOT_CLIENT_ID"), masked: maskValue(process.env.AWS_IOT_CLIENT_ID), required: "optional", serverOnly: true, description: "MQTT client ID" },
    { key: "AWS_IOT_TOPIC_TELEMETRY", present: isPresent("AWS_IOT_TOPIC_TELEMETRY"), masked: maskValue(process.env.AWS_IOT_TOPIC_TELEMETRY), required: "optional", serverOnly: true, description: "Telemetry MQTT topic" },
    { key: "AWS_IOT_TOPIC_COMMANDS", present: isPresent("AWS_IOT_TOPIC_COMMANDS"), masked: maskValue(process.env.AWS_IOT_TOPIC_COMMANDS), required: "optional", serverOnly: true, description: "Command MQTT topic" },
    { key: "GEMINI_API_KEY", present: isPresent("GEMINI_API_KEY"), masked: "(server-only, never exposed)", required: "optional", serverOnly: true, description: "Gemini API key (server-only)" },
    { key: "OPENAI_API_KEY", present: isPresent("OPENAI_API_KEY"), masked: "(server-only, never exposed)", required: "optional", serverOnly: true, description: "OpenAI API key (server-only)" },
    { key: "XRPL_TESTNET_WS", present: isPresent("XRPL_TESTNET_WS"), masked: maskValue(process.env.XRPL_TESTNET_WS), required: "optional", serverOnly: true, description: "XRPL testnet websocket URL" },
    { key: "XRPL_TESTNET_JSON_RPC", present: isPresent("XRPL_TESTNET_JSON_RPC"), masked: maskValue(process.env.XRPL_TESTNET_JSON_RPC), required: "optional", serverOnly: true, description: "XRPL testnet JSON-RPC URL" },
    { key: "XRPL_ANCHOR_SEED", present: isPresent("XRPL_ANCHOR_SEED"), masked: "(server-only, never exposed)", required: "optional", serverOnly: true, description: "XRPL anchor wallet seed (server-only)" },
    { key: "XRPL_PROOF_DESTINATION", present: isPresent("XRPL_PROOF_DESTINATION"), masked: maskValue(process.env.XRPL_PROOF_DESTINATION), required: "optional", serverOnly: true, description: "XRPL proof destination address" },
    { key: "HEDERA_EVM_CHAIN_ID", present: isPresent("HEDERA_EVM_CHAIN_ID"), masked: maskValue(process.env.HEDERA_EVM_CHAIN_ID), required: "optional", serverOnly: false, description: "Hedera EVM chain id (default 296)" },
    { key: "HEDERA_EVM_RPC_URL", present: isPresent("HEDERA_EVM_RPC_URL"), masked: maskValue(process.env.HEDERA_EVM_RPC_URL), required: "optional", serverOnly: true, description: "Hedera EVM JSON-RPC URL" },
    { key: "HEDERA_EVM_PRIVATE_KEY", present: isPresent("HEDERA_EVM_PRIVATE_KEY"), masked: "(server-only, never exposed)", required: "optional", serverOnly: true, description: "Hedera EVM private key (server-only)" },
    { key: "HEDERA_PROOF_LEDGER_CONTRACT_ADDRESS", present: isPresent("HEDERA_PROOF_LEDGER_CONTRACT_ADDRESS"), masked: maskValue(process.env.HEDERA_PROOF_LEDGER_CONTRACT_ADDRESS), required: "optional", serverOnly: false, description: "Deployed TNProofLedger contract address" },
    { key: "REQUIRE_OPERATOR_APPROVAL", present: isPresent("REQUIRE_OPERATOR_APPROVAL"), masked: maskValue(process.env.REQUIRE_OPERATOR_APPROVAL), required: "optional", serverOnly: false, description: "Approval gate flag" },
    { key: "ALLOW_DIRECT_MACHINE_CONTROL", present: isPresent("ALLOW_DIRECT_MACHINE_CONTROL"), masked: maskValue(process.env.ALLOW_DIRECT_MACHINE_CONTROL), required: "optional", serverOnly: false, description: "Direct machine control must be false." },
  ];
}

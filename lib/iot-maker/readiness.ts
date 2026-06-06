// lib/iot-maker/readiness.ts

import type { ReadinessCheck, ServiceStatus } from "./types";
import { getRuntimeModes } from "./serviceHealth";

type EnvValue = string | undefined;

function env(key: string): EnvValue {
  return process.env[key];
}

function present(key: string): boolean {
  const value = env(key);
  return typeof value === "string" && value.trim().length > 0;
}

function providerStatus(aiProvider: string): ServiceStatus {
  if (aiProvider === "mock") return "simulated";
  const requiredKey =
    aiProvider === "gemini" ? "GEMINI_API_KEY" : "OPENAI_API_KEY";
  return present(requiredKey) ? "ready" : "missing";
}

export function buildReadinessChecks(): ReadinessCheck[] {
  const { dataMode, iotMode, proofMode, aiProvider } = getRuntimeModes();
  const detectedAiProvider = env("AI_PROVIDER") || aiProvider;
  const proofModeValue = proofMode;
  const operatorApprovalEnabled = env("REQUIRE_OPERATOR_APPROVAL") !== "false";
  const directMachineControlBlocked = env("ALLOW_DIRECT_MACHINE_CONTROL") !== "true";
  const safetyModeBlocked = !operatorApprovalEnabled || !directMachineControlBlocked;

  const checks: ReadinessCheck[] = [
    {
      id: "vercel_runtime",
      service: "vercel",
      label: "Runtime environment",
      status: "ready",
      requiredForDemo: true,
      requiredForConnected: true,
      safeMessage: "Next.js runtime and server route execution available.",
    },
    {
      id: "proof_mode",
      service: "proof_ledger",
      label: "Proof mode",
      status: env("PROOF_MODE") ? "ready" : "simulated",
      requiredForDemo: false,
      requiredForConnected: false,
      safeMessage: `Proof mode: ${proofModeValue}.`,
    },
    {
      id: "iot_mode",
      service: "browser_ui",
      label: "IOT_MODE",
      status: iotMode === "connected" ? "ready" : "simulated",
      requiredForDemo: false,
      requiredForConnected: false,
      safeMessage: `IOT_MODE is ${iotMode}.`,
    },
    {
      id: "data_mode",
      service: "browser_ui",
      label: "DATA_MODE",
      status: dataMode === "connected" ? "ready" : "simulated",
      requiredForDemo: false,
      requiredForConnected: false,
      safeMessage: `DATA_MODE is ${dataMode}.`,
    },
    {
      id: "supabase_url",
      service: "supabase",
      label: "Supabase URL",
      status: present("NEXT_PUBLIC_SUPABASE_URL") ? "ready" : "simulated",
      requiredForDemo: false,
      requiredForConnected: true,
      safeMessage: present("NEXT_PUBLIC_SUPABASE_URL")
        ? "Supabase URL configured."
        : "Supabase URL is missing. Demo mode only.",
    },
    {
      id: "supabase_anon",
      service: "supabase",
      label: "Supabase anon key",
      status: present("NEXT_PUBLIC_SUPABASE_ANON_KEY") ? "ready" : "simulated",
      requiredForDemo: false,
      requiredForConnected: true,
      safeMessage: present("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        ? "Supabase anon key configured."
        : "Supabase anon key is missing. Demo mode only.",
    },
    {
      id: "supabase_service_role",
      service: "supabase",
      label: "Supabase service role (server-only)",
      status: present("SUPABASE_SERVICE_ROLE_KEY") ? "ready" : "simulated",
      requiredForDemo: false,
      requiredForConnected: true,
      safeMessage: present("SUPABASE_SERVICE_ROLE_KEY")
        ? "Service role key present for safe server writes."
        : "Service role key missing. Proof persistence will be read-only.",
      secret: true,
    },
    {
      id: "aws_iot_endpoint",
      service: "aws_iot",
      label: "AWS IoT endpoint",
      status: present("AWS_IOT_ENDPOINT") ? "ready" : "simulated",
      requiredForDemo: false,
      requiredForConnected: true,
      safeMessage: present("AWS_IOT_ENDPOINT")
        ? "AWS IoT endpoint configured."
        : "AWS IoT endpoint missing. Connected command path unavailable.",
      secret: true,
    },
    {
      id: "aws_iot_telemetry_topic",
      service: "aws_iot",
      label: "AWS IoT telemetry topic",
      status: present("AWS_IOT_TOPIC_TELEMETRY") ? "ready" : "simulated",
      requiredForDemo: false,
      requiredForConnected: true,
      safeMessage: present("AWS_IOT_TOPIC_TELEMETRY")
        ? "Telemetry topic configured."
        : "Telemetry topic not set. Mock topic will be shown.",
    },
    {
      id: "aws_iot_command_topic",
      service: "aws_iot",
      label: "AWS IoT command topic",
      status: present("AWS_IOT_TOPIC_COMMANDS") ? "ready" : "simulated",
      requiredForDemo: false,
      requiredForConnected: true,
      safeMessage: present("AWS_IOT_TOPIC_COMMANDS")
        ? "Command topic configured."
        : "Command topic not set. Mock publish endpoint used.",
    },
    {
      id: "operator_gate",
      service: "operator_gate",
      label: "Operator approval gate",
      status: safetyModeBlocked ? "blocked" : "ready",
      requiredForDemo: true,
      requiredForConnected: true,
      safeMessage:
        safetyModeBlocked
          ? "Unsafe safety flags: require operator approval and disable direct control before dispatch."
          : "Operator gate active. Approval required before dispatch.",
    },
    {
      id: "require_approval",
      service: "operator_gate",
      label: "REQUIRE_OPERATOR_APPROVAL flag",
      status: operatorApprovalEnabled ? "ready" : "blocked",
      requiredForDemo: true,
      requiredForConnected: true,
      safeMessage: operatorApprovalEnabled
        ? "REQUIRE_OPERATOR_APPROVAL is enabled."
        : "REQUIRE_OPERATOR_APPROVAL is false. Dispatch is blocked by policy.",
    },
    {
      id: "direct_machine_control",
      service: "operator_gate",
      label: "ALLOW_DIRECT_MACHINE_CONTROL flag",
      status: directMachineControlBlocked ? "ready" : "blocked",
      requiredForDemo: true,
      requiredForConnected: true,
      safeMessage: directMachineControlBlocked
        ? "Direct machine control is currently blocked; commands remain advisory-only."
        : "ALLOW_DIRECT_MACHINE_CONTROL is true. Direct write operations are unsafe and blocked.",
    },
    {
      id: "ai_provider",
      service: detectedAiProvider === "gemini" ? "gemini" : detectedAiProvider === "openai" ? "openai" : "browser_ui",
      label: "AI provider",
      status: detectedAiProvider === "mock" ? "simulated" : providerStatus(detectedAiProvider),
      requiredForDemo: false,
      requiredForConnected: detectedAiProvider !== "mock",
      safeMessage:
        detectedAiProvider === "mock"
          ? "Mock AI provider active."
          : `${detectedAiProvider.toUpperCase()} selected.`,
      secret: true,
    },
  ];

  if (proofModeValue === "xrpl_testnet") {
    checks.push(
      {
        id: "xrpl_seed",
        service: "xrpl_testnet",
        label: "XRPL anchor seed (server-only)",
        status: present("XRPL_ANCHOR_SEED") ? "ready" : "missing",
        requiredForDemo: false,
        requiredForConnected: false,
        safeMessage: present("XRPL_ANCHOR_SEED")
          ? "XRPL seed configured."
          : "XRPL anchor seed missing.",
        secret: true,
      },
      {
        id: "xrpl_ws",
        service: "xrpl_testnet",
        label: "XRPL websocket endpoint",
        status: present("XRPL_TESTNET_WS") ? "ready" : "missing",
        requiredForDemo: false,
        requiredForConnected: false,
        safeMessage: present("XRPL_TESTNET_WS")
          ? "XRPL websocket endpoint configured."
          : "XRPL websocket endpoint missing.",
      },
      {
        id: "xrpl_destination",
        service: "xrpl_testnet",
        label: "XRPL proof destination",
        status: present("XRPL_PROOF_DESTINATION") ? "ready" : "missing",
        requiredForDemo: false,
        requiredForConnected: false,
        safeMessage: present("XRPL_PROOF_DESTINATION")
          ? "XRPL destination configured."
          : "XRPL destination missing.",
      }
    );
  }

  if (proofModeValue === "hedera_testnet") {
    checks.push(
      {
        id: "hedera_private_key",
        service: "hedera_testnet",
        label: "Hedera private key (server-only)",
        status: present("HEDERA_EVM_PRIVATE_KEY") ? "ready" : "missing",
        requiredForDemo: false,
        requiredForConnected: false,
        safeMessage: present("HEDERA_EVM_PRIVATE_KEY")
          ? "Hedera private key present."
          : "Hedera private key missing.",
        secret: true,
      },
      {
        id: "hedera_rpc",
        service: "hedera_testnet",
        label: "Hedera RPC URL",
        status: present("HEDERA_EVM_RPC_URL") ? "ready" : "missing",
        requiredForDemo: false,
        requiredForConnected: false,
        safeMessage: present("HEDERA_EVM_RPC_URL")
          ? "Hedera JSON-RPC URL configured."
          : "Hedera JSON-RPC URL missing.",
      },
      {
        id: "hedera_contract",
        service: "hedera_testnet",
        label: "TNProofLedger contract",
        status: present("HEDERA_PROOF_LEDGER_CONTRACT_ADDRESS") ? "ready" : "missing",
        requiredForDemo: false,
        requiredForConnected: false,
        safeMessage: present("HEDERA_PROOF_LEDGER_CONTRACT_ADDRESS")
          ? "Contract address configured."
          : "Contract address missing.",
      }
    );
  }

  return checks;
}

function hasRequiredConnection(checks: ReadinessCheck[]): boolean {
  return checks
    .filter((check) => check.requiredForConnected)
    .every((check) => check.status === "ready");
}

function hasBlockedRisk(checks: ReadinessCheck[]): boolean {
  return checks.some((check) => check.requiredForDemo && check.status === "blocked");
}

export function deriveRuntimeMode(
  checks: ReadinessCheck[]
): "demo" | "partial" | "connected" | "blocked" {
  if (hasBlockedRisk(checks)) {
    return "blocked";
  }
  if (hasRequiredConnection(checks)) {
    return "connected";
  }
  return checks.some((check) => check.status === "ready") ? "partial" : "demo";
}

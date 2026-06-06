import type { RuntimeMode } from "./types";

export type RuntimeModeConfig = "mock" | "connected" | "partial";

export type IoTHealth = {
  dataMode: RuntimeModeConfig;
  iotMode: RuntimeModeConfig;
  proofMode: "mock" | "xrpl_testnet" | "hedera_testnet" | "disabled";
  aiProvider: "mock" | "gemini" | "openai";
  runtimeMode: RuntimeMode;
  requireOperatorApproval: boolean;
  allowDirectMachineControl: boolean;
};

function parseMode(raw: string | undefined, fallback: RuntimeModeConfig): RuntimeModeConfig {
  if (raw === "connected" || raw === "partial") return raw;
  return fallback;
}

function parseProofMode(
  raw: string | undefined
): IoTHealth["proofMode"] {
  if (raw === "xrpl_testnet" || raw === "hedera_testnet" || raw === "disabled") {
    return raw;
  }
  return "mock";
}

function parseAIProvider(raw: string | undefined): IoTHealth["aiProvider"] {
  if (raw === "gemini" || raw === "openai") return raw;
  return "mock";
}

export function getRuntimeModes(): {
  dataMode: RuntimeModeConfig;
  iotMode: RuntimeModeConfig;
  proofMode: IoTHealth["proofMode"];
  aiProvider: IoTHealth["aiProvider"];
  runtimeMode: IoTHealth["runtimeMode"];
  requireOperatorApproval: boolean;
  allowDirectMachineControl: boolean;
} {
  const dataMode = parseMode(process.env.DATA_MODE?.toLowerCase(), "mock");
  const iotMode = parseMode(process.env.IOT_MODE?.toLowerCase(), "mock");
  const proofMode = parseProofMode(process.env.PROOF_MODE);
  const aiProvider = parseAIProvider(process.env.AI_PROVIDER);
  const unsafeGateDisabled =
    process.env.REQUIRE_OPERATOR_APPROVAL === "false" || process.env.ALLOW_DIRECT_MACHINE_CONTROL === "true";
  const runtimeMode: RuntimeMode = unsafeGateDisabled
    ? "blocked"
    : dataMode === "connected" && iotMode === "connected"
      ? "connected"
      : dataMode === "mock" && iotMode === "mock"
        ? "demo"
        : "partial";
  const requireOperatorApproval = process.env.REQUIRE_OPERATOR_APPROVAL !== "false";
  const allowDirectMachineControl = process.env.ALLOW_DIRECT_MACHINE_CONTROL === "true";

  return {
    dataMode,
    iotMode,
    proofMode,
    aiProvider,
    runtimeMode,
    requireOperatorApproval,
    allowDirectMachineControl,
  };
}

export function isConnectedMode(): boolean {
  const { dataMode, iotMode } = getRuntimeModes();
  return dataMode === "connected" && iotMode === "connected";
}

export function isReadyForConnectedFlow(): boolean {
  const { requireOperatorApproval, allowDirectMachineControl } = getRuntimeModes();
  return requireOperatorApproval && !allowDirectMachineControl;
}

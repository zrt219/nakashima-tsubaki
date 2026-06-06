// Returns safe operational status. Never returns secrets.

import { NextResponse } from "next/server";
import { buildReadinessChecks, deriveRuntimeMode } from "@/lib/iot-maker/readiness";
import { buildEnvRegistry } from "@/lib/iot-maker/envRegistry";
import { getProofReadiness, getProofMode } from "@/lib/proof-ledger/proofLedgerService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const checks = buildReadinessChecks();
    const runtimeMode = deriveRuntimeMode(checks);
    const envChecks = buildEnvRegistry();
    const proofMode = getProofMode();
    const proofReadiness = getProofReadiness();

    const warnings: string[] = [];
    if (process.env.ALLOW_DIRECT_MACHINE_CONTROL === "true") {
      warnings.push("ALLOW_DIRECT_MACHINE_CONTROL is true. This is unsafe and must be set to false.");
    }
    if (!process.env.REQUIRE_OPERATOR_APPROVAL || process.env.REQUIRE_OPERATOR_APPROVAL === "false") {
      warnings.push("REQUIRE_OPERATOR_APPROVAL is not set or false. Operator gate is weakened.");
    }

    const safetyStatus = {
      approvalGateActive: process.env.REQUIRE_OPERATOR_APPROVAL !== "false",
      directMachineControlDisabled: process.env.ALLOW_DIRECT_MACHINE_CONTROL !== "true",
      blockchainControlsNothing: true,
      telemetryIsOffChain: true,
      secretsNeverExposed: true,
    };

    // Filter env checks: never return actual secret values
    const safeEnvChecks = envChecks.map((entry) => ({
      key: entry.key,
      present: entry.present,
      masked: entry.masked,
      required: entry.required,
      serverOnly: entry.serverOnly,
      description: entry.description,
    }));

    return NextResponse.json({
      runtimeMode,
      services: checks,
      envChecks: safeEnvChecks,
      warnings,
      safetyStatus,
      proofStatus: {
        mode: proofMode,
        mockReady: proofReadiness.mockReady,
        xrplReady: proofReadiness.xrplReady,
        hederaReady: proofReadiness.hederaReady,
        xrplConfig: proofReadiness.xrplConfig,
        hederaConfig: proofReadiness.hederaConfig,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Health check failed", detail }, { status: 500 });
  }
}

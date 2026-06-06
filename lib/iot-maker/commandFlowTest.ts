// Server-safe command-flow simulation for IoT Maker commissioning.

import crypto from "node:crypto";
import { DEMO_SCENARIOS, generateDemoTelemetry } from "./demoTelemetry";
import { buildReadinessChecks, deriveRuntimeMode } from "./readiness";
import { assertSafeToDispatch, SAFETY_POLICY } from "./safetyPolicy";
import { getRuntimeModes } from "./serviceHealth";
import type { CommandFlowResult, CommissioningTestStep, RuntimeMode } from "./types";

export type CommandProposalType =
  | "inspect_coolant_loop"
  | "recommend_spindle_adjustment"
  | "create_quality_hold";

type CommandProposal = {
  commandId: string;
  type: CommandProposalType;
  rationale: string;
  confidence: number;
  requiresOperatorApproval: true;
};

type DispatchRecord = {
  mode: "demo" | "connected";
  commandType: CommandProposalType;
  commandId: string;
  channel: "simulator_bus_mock" | "edge_iot_topic_mock";
  payload: string;
};

const COMMAND_PROPOSALS: Record<string, Omit<CommandProposal, "commandId" | "requiresOperatorApproval">> = {
  thermal_drift: {
    type: "inspect_coolant_loop",
    rationale:
      "Telemetry shows rising thermal drift and coolant temperature variance. Recommend inspection and review before changes.",
    confidence: 0.93
  },
  vibration_anomaly: {
    type: "recommend_spindle_adjustment",
    rationale:
      "Vibration and roundness moved outside normal envelopes. Recommend a controlled spindle adjustment review.",
    confidence: 0.89
  },
  blower_deviation: {
    type: "inspect_coolant_loop",
    rationale: "Blower pressure dipped and edge latency is elevated. Verify utilities before applying corrective action.",
    confidence: 0.86
  },
  quality_hold: {
    type: "create_quality_hold",
    rationale:
      "Surface defect metric increased and release quality state may be compromised. Hold the lot for review.",
    confidence: 0.97
  },
  traceability_gap: {
    type: "create_quality_hold",
    rationale: "Telemetry indicates provenance completeness gap in trace data. Enforce a controlled evidence hold.",
    confidence: 0.91
  }
};

function buildRunId(prefix = "iot-run") {
  return `${prefix}-${new Date().toISOString().replace(/[:.]/g, "-")}-${crypto.randomUUID().slice(0, 8)}`;
}

function validateTelemetrySchema(telemetry: Record<string, unknown>): boolean {
  const requiredKeys = [
    "spindle_speed_rpm",
    "coolant_temp_c",
    "thermal_drift_um",
    "vibration_rms_mm_s",
    "roller_roundness_delta_um",
    "ball_surface_defect_ppm",
    "blower_pressure_kpa",
    "qa_hold_status",
    "edge_latency_ms",
    "mqtt_command_status"
  ];

  return requiredKeys.every((key) => telemetry[key] !== undefined);
}

function chooseRuntimeMode(): RuntimeMode {
  const health = buildReadinessChecks();
  return deriveRuntimeMode(health);
}

function resolveProvider() {
  const envProvider = process.env.AI_PROVIDER?.toLowerCase();
  if (envProvider === "gemini") {
    return {
      provider: "gemini" as const,
      configured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim())
    };
  }
  if (envProvider === "openai") {
    return {
      provider: "openai" as const,
      configured: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim())
    };
  }
  return { provider: "mock" as const, configured: true };
}

function buildAiDiagnostic(
  scenarioId: string,
  telemetry: Record<string, unknown>,
  proposal: CommandProposal
) {
  const provider = resolveProvider();
  const base = `Scenario ${scenarioId}: ${proposal.rationale}`;
  const confidence = `Confidence ${(proposal.confidence * 100).toFixed(1)}%`;
  const temp = telemetry.coolant_temp_c;
  const drift = telemetry.thermal_drift_um;
  const vibration = telemetry.vibration_rms_mm_s;

  if (provider.provider === "mock") {
    return `${base} ${confidence}. MOCK provider active; deterministic advisory mode used.`;
  }

  if (!provider.configured) {
    return `${base} ${confidence}. ${provider.provider.toUpperCase()} key missing; provider path blocked for safety.`;
  }

  return `${base} ${confidence}. Provider ${provider.provider.toUpperCase()} analyzed sample: temp=${temp}, drift=${drift}, vibration=${vibration}.`;
}

function buildCommandProposal(scenarioId: string): Omit<CommandProposal, "commandId" | "requiresOperatorApproval"> {
  return COMMAND_PROPOSALS[scenarioId] ?? COMMAND_PROPOSALS.thermal_drift;
}

function buildDispatchRecord(mode: "demo" | "connected", proposal: CommandProposal): DispatchRecord {
  const commandChannel = mode === "connected" ? "edge_iot_topic_mock" : "simulator_bus_mock";
  const commandRationale = proposal.rationale;
  const commandType = proposal.type;
  return {
    mode,
    commandType,
    commandId: proposal.commandId,
    channel: commandChannel,
    payload: JSON.stringify({
      action: commandType,
      commandId: proposal.commandId,
      commandRationale,
      approved: true,
      transportMode: mode,
      timestamp: new Date().toISOString()
    })
  };
}

export function runCommandFlowTest(
  scenarioId: string | undefined,
  options?: { approve?: boolean }
): CommandFlowResult {
  const scenario = DEMO_SCENARIOS.find((entry) => entry.id === scenarioId) ?? DEMO_SCENARIOS[0];
  const telemetry = generateDemoTelemetry(scenario.id) as Record<string, unknown>;
  const telemetrySchemaOk = validateTelemetrySchema(telemetry);

  const now = new Date().toISOString();
  const generatedRunId = buildRunId();
  const runtimeMode = chooseRuntimeMode();
  const modes = getRuntimeModes();

  const proposalTemplate = buildCommandProposal(scenario.id);
  const commandProposal: CommandProposal = {
    commandId: crypto.createHash("sha256").update(`${generatedRunId}-${scenario.id}-${proposalTemplate.type}`).digest("hex"),
    requiresOperatorApproval: true,
    ...proposalTemplate
  };

  const steps: CommissioningTestStep[] = [
    {
      id: "generate_telemetry",
      label: "Generate synthetic telemetry packet",
      service: "aws_iot",
      status: "passed",
      evidence: `scenario=${scenario.id}`,
      timestamp: now
    },
    {
      id: "validate_schema",
      label: "Validate telemetry schema",
      service: "edge_bridge",
      status: telemetrySchemaOk ? "passed" : "failed",
      evidence: telemetrySchemaOk ? "All required keys present." : "Telemetry key set mismatch.",
      timestamp: new Date().toISOString()
    },
    {
      id: "build_diagnostic",
      label: "Run structured recommendation path",
      service: "browser_ui",
      status: "passed",
      evidence: commandProposal.type,
      timestamp: new Date().toISOString()
    }
  ];

  let operatorApprovalStatus: CommandFlowResult["operatorApprovalStatus"] = "required";
  let dispatchStatus: CommandFlowResult["dispatchStatus"] = "no_dispatch";
  let dispatchRecord: DispatchRecord | null = null;

  const approvalRequested = options?.approve === true;

  if (runtimeMode === "blocked" || !SAFETY_POLICY.requireOperatorApproval || SAFETY_POLICY.allowDirectMachineControl) {
    steps.push({
      id: "operator_gate",
      label: "Operator approval gate",
      service: "operator_gate",
      status: "blocked",
      evidence: "Mode is not safe for command dispatch. Approval + no-direct-control flags must be satisfied.",
      timestamp: new Date().toISOString()
    });
    operatorApprovalStatus = "blocked";
    dispatchStatus = "blocked";
  } else if (!approvalRequested) {
    steps.push({
      id: "operator_gate",
      label: "Operator approval check",
      service: "operator_gate",
      status: "blocked",
      evidence: "No approval token provided in request payload.",
      timestamp: new Date().toISOString()
    });
    operatorApprovalStatus = "required";
    dispatchStatus = "no_dispatch";
  } else {
    try {
      assertSafeToDispatch(approvalRequested);
      const dispatchMode = runtimeMode === "connected" && modes.iotMode === "connected" && modes.dataMode === "connected"
        ? "connected"
        : "demo";
      dispatchRecord = buildDispatchRecord(dispatchMode, commandProposal);
      dispatchStatus = dispatchMode === "connected" ? "connected_mocked" : "simulated";
      operatorApprovalStatus = "approved";
      steps.push({
        id: "operator_gate",
        label: "Operator approval check",
        service: "operator_gate",
        status: "passed",
        evidence: "Operator approval granted for advisory recommendation.",
        timestamp: new Date().toISOString()
      });
      steps.push({
        id: "dispatch",
        label: "Dispatch simulation",
        service: "edge_bridge",
        status: dispatchMode === "connected" ? "passed" : "passed",
        evidence: `dispatchMode=${dispatchMode}`,
        timestamp: new Date().toISOString()
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "unknown dispatch error";
      dispatchStatus = "blocked";
      operatorApprovalStatus = "blocked";
      steps.push({
        id: "operator_gate",
        label: "Operator approval check",
        service: "operator_gate",
        status: "failed",
        evidence: message,
        timestamp: new Date().toISOString()
      });
    }
  }

  const aiDiagnostic = buildAiDiagnostic(scenario.id, telemetry, commandProposal);

  return {
    runId: generatedRunId,
    scenarioId: scenario.id,
    scenarioLabel: scenario.name,
    runtimeMode,
    telemetry,
    telemetrySchemaOk,
    aiDiagnostic,
    commandProposal,
    operatorApprovalStatus,
    dispatchStatus,
    dispatchRecord: dispatchRecord ?? undefined,
    steps,
    generatedAt: now
  };
}

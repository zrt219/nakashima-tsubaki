import crypto from "node:crypto";

import { DEMO_SCENARIOS, generateDemoTelemetry } from "@/lib/iot-maker/demoTelemetry";
import { buildEvidencePacket, anchorEvidence, getProofMode } from "@/lib/proof-ledger/proofLedgerService";
import { hashString } from "@/lib/proof-ledger/hashEvidence";
import { REFLEX_TIMELINE_SEQUENCE, type ReflexTimelineStep, REFLEX_TIMELINE_LOOKUP } from "@/lib/reflex-agents/reflexTimeline";
import {
  evaluateAllReflexEvals,
  type ReflexEvalContext,
  evaluateSafetyEval,
  evaluateNoDirectPlcEval,
} from "@/lib/reflex-agents/reflexEvals";
import { getReflexAgent } from "@/lib/reflex-agents/agents";
import { getAllReflexTools, getReflexTool } from "@/lib/reflex-agents/reflexTools";
import { getNextReflexPhase, isTerminalPhase } from "@/lib/reflex-agents/reflexStateMachine";
import { buildCandidateMemories } from "@/lib/reflex-agents/reflexMemory";
import { getReflexRun, listReflexRuns, upsertReflexRun } from "@/lib/reflex-agents/reflexStore";
import { makePhaseLabel } from "@/lib/reflex-agents/reflexStateMachine";
import type {
  ReflexAgentEvent,
  ReflexEvalResult,
  ReflexImprovementProposal,
  ReflexMemoryRecord,
  ReflexPhase,
  ReflexRun,
  ReflexToolCall,
  OperatorDecision,
  ReflexToolCallStatus,
} from "@/lib/reflex-agents/types";

export type ReflexModelArenaStatus =
  | "connected"
  | "missing_key"
  | "not_implemented"
  | "mock_active"
  | "blocked_by_safety";

export type ReflexModelProvider = {
  id: "mock" | "openai" | "gemini" | "claude" | "llama";
  label: string;
  ready: boolean;
  status: ReflexModelArenaStatus;
  connectedModeStatus: string;
  readinessLabel: string;
  latestOutputSummary?: string;
  latestLatencyMs?: number;
  latestLogCount: number;
  supportsToolProposals: boolean;
  supportsStructuredOutput: boolean;
  requiresSafetyGate: boolean;
};

export type ReflexRunRequest = {
  scenarioId?: string;
  approve?: boolean;
  simulateApprovalDelayMs?: number;
  forceBlock?: boolean;
  forceProofBlock?: boolean;
};

export type ReflexRunEnvelope = {
  run: ReflexRun;
  providerArena: ReflexModelProvider[];
  summary: string;
};

type TimelineMarker = {
  phase: ReflexPhase;
  label: string;
  startAtMs: number;
  endAtMs: number;
};

type ProviderFlags = {
  aiProvider: string;
  hasOpenAI: boolean;
  hasGemini: boolean;
  hasClaude: boolean;
  hasLlama: boolean;
};

const DEMO_SEQUENCE: TimelineMarker[] = REFLEX_TIMELINE_SEQUENCE.map((step) => ({
  phase: step.phase,
  label: step.label,
  startAtMs: step.startAtMs,
  endAtMs: step.endAtMs,
}));

const TOOL_RISK_BY_SCENARIO: Record<string, ReflexImprovementProposal> = {
  thermal_drift: {
    id: "improve-thermal-flow",
    title: "Add coolant-flow sensor to reduce thermal-drift uncertainty.",
    problemObserved: "Thermal anomaly confidence drifts when coolant-load is inferred from a single temperature point.",
    proposedChange: "Attach dedicated coolant-flow sensing and include flow confidence in proposal gates.",
    expectedBenefit: "Lower false positives and reduce unnecessary advisory escalations.",
    riskLevel: "low",
    requiresHumanApproval: true,
    affectedLayer: "telemetry",
    evalRequired: ["evidence_completeness_eval", "operator_gate_eval", "proof_integrity_eval"],
    rollbackPlan: "Disable the flow-driven branch and rely on thermal trend only.",
    status: "draft",
  },
  vibration_anomaly: {
    id: "improve-vibration-threshold",
    title: "Tighten approval threshold for high-vibration events.",
    problemObserved: "Vibration runs can promote dispatch before sufficient evidence context is loaded.",
    proposedChange: "Raise evidence threshold for dispatch proposal on repeated vibration spikes.",
    expectedBenefit: "Reduce unsafe dispatch and operator churn.",
    riskLevel: "medium",
    requiresHumanApproval: true,
    affectedLayer: "safety_policy",
    evalRequired: ["tool_permission_eval", "safety_eval", "tutorial_understanding_eval"],
    rollbackPlan: "Restore previous threshold after three successful simulation cycles.",
    status: "draft",
  },
  traceability_gap: {
    id: "improve-traceability-source",
    title: "Add missing SOP source for spindle thermal compensation.",
    problemObserved: "Proposal rationale is not tied to an explicit source policy note.",
    proposedChange: "Require SOP source references in every thermal compensation branch.",
    expectedBenefit: "Improved auditability and operator trust.",
    riskLevel: "low",
    requiresHumanApproval: true,
    affectedLayer: "source_docs",
    evalRequired: ["evidence_completeness_eval", "no_secret_leak_eval", "no_direct_plc_eval"],
    rollbackPlan: "Disable SOP source gating and return to advisory-only branch.",
    status: "draft",
  },
};

function makeRunId() {
  return `reflex-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`;
}

function nowStamp(baseMs: number, offsetMs: number) {
  return new Date(baseMs + offsetMs).toISOString();
}

function pickScenarioId(rawScenario?: string) {
  const known = rawScenario?.trim().toLowerCase();
  return known && DEMO_SCENARIOS.some((scenario) => scenario.id === known)
    ? known
    : DEMO_SCENARIOS[0]!.id;
}

function buildBaseRun(scenarioId: string): ReflexRun {
  const start = new Date().toISOString();
  return {
    id: makeRunId(),
    scenarioId,
    startedAt: start,
    phase: "idle",
    agents: [],
    toolCalls: [],
    evals: [],
    timeline: [],
    notes: [],
  };
}

function toTimelineStepFromPhase(stepPhase: ReflexPhase, timestampBase: number): TimelineMarker {
  const step = REFLEX_TIMELINE_LOOKUP.get(stepPhase);
  if (!step) {
    return {
      phase: stepPhase,
      label: makePhaseLabel(stepPhase),
      startAtMs: 0,
      endAtMs: 0,
    };
  }
  return { phase: step.phase, label: step.label, startAtMs: step.startAtMs, endAtMs: step.endAtMs };
}

function addAgentEvent(
  run: ReflexRun,
  phase: ReflexPhase,
  role: string,
  action: string,
  inputSummary?: string,
  outputSummary?: string,
  approvalState: ReflexAgentEvent["approvalState"] = "not_required"
) {
  const startedAt = new Date().toISOString();
  const event: ReflexAgentEvent = {
    id: `event-${run.id}-${role}-${Date.now()}`,
    runId: run.id,
    phase,
    agent: role as ReflexAgentEvent["agent"],
    action,
    inputSummary,
    outputSummary,
    startedAt,
    completedAt: startedAt,
    durationMs: 0,
    risk: "low",
    approvalState,
    logId: `${run.id}-${phase}-${role}`,
  };
  run.agents.push(event);
}

function createToolCall(
  run: ReflexRun,
  toolId: string,
  phase: ReflexPhase,
  agent: string,
  input: Record<string, unknown>,
  output: Record<string, unknown>,
  durationMs: number,
  status: ReflexToolCallStatus = "completed",
  blockedReason?: string
) {
  const tool = getReflexTool(toolId);
  const now = new Date().toISOString();
  const toolCall: ReflexToolCall = {
    id: `tool-${run.id}-${toolId}-${crypto.randomBytes(4).toString("hex")}`,
    toolId,
    toolLabel: tool?.label ?? toolId,
    phase,
    agent: (agent as ReflexToolCall["agent"]),
    startedAt: now,
    completedAt: now,
    status,
    input,
    output,
    durationMs,
    risk: tool?.riskLevel ?? "low",
    blockedReason,
  };
  run.toolCalls.push(toolCall);
  return toolCall;
}

function addPhaseContext(run: ReflexRun, phase: ReflexPhase, ts: number) {
  const step = toTimelineStepFromPhase(phase, 0);
  run.timeline.push({
    phase,
    label: step.label,
    startedAt: nowStamp(ts, step.startAtMs),
    completedAt: nowStamp(ts, step.endAtMs),
  });
}

function buildToolOutputForPhase(
  phase: ReflexPhase,
  telemetry: Record<string, unknown>,
  scenarioId: string,
  run: ReflexRun
) {
  switch (phase) {
    case "observing":
      return {
        telemetryHash: hashString(JSON.stringify(telemetry)),
        keysObserved: Object.keys(telemetry),
        scenarioId,
      };
    case "selecting_tools":
      return {
        presetRows: 4,
        sourceMatches: 7,
        sourceReady: true,
      };
    case "simulating":
      return {
        diagnostic: "Moderate drift with control window available.",
        toolCandidate: "inspect_coolant_loop",
        requiresApproval: true,
      };
    case "evaluating":
      return {
        ruleSet: "reflex-operator-safe-v1",
        requiresOperatorGate: true,
      };
    case "approval_required":
      return {
        reason: "Policy requires explicit human approval before dispatch.",
        requestedAt: run.startedAt,
      };
    case "dispatching":
      return {
        dispatchMode: "mock_iot_shadow_bus",
        channel: "reflex_shadow",
      };
    case "capturing_evidence":
      return {
        evidencePacketMode: "DEMO",
        eventLedger: "run_evidence_packet_stage1",
      };
    case "anchoring_proof":
      return {
        proofMode: getProofMode(),
        mode: "hash-first",
      };
    case "reflecting":
      return {
        reflectionType: "run_eval_bundle",
      };
    case "proposing_improvement":
      return {
        proposalReady: true,
      };
    case "memory_update_ready":
      return {
        memoryBoundary: "run_memory_staged_if_approved",
      };
    default:
      return {
        phase,
      };
  }
}

function normalizeDecision(approved: boolean, reason: string): OperatorDecision {
  return {
    status: approved ? "approved" : "rejected",
    note: reason,
    decidedAt: new Date().toISOString(),
    by: approved ? "operator" : "operator",
  };
}

function getProviderFlags(): ProviderFlags {
  return {
    aiProvider: (process.env.AI_PROVIDER ?? "mock").toLowerCase(),
    hasOpenAI: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0),
    hasGemini: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0),
    hasClaude: Boolean(process.env.CLAUDE_API_KEY && process.env.CLAUDE_API_KEY.trim().length > 0),
    hasLlama: Boolean(process.env.LLAMA_API_KEY && process.env.LLAMA_API_KEY.trim().length > 0),
  };
}

function buildProviderArena(flags: ProviderFlags): ReflexModelProvider[] {
  return [
    {
      id: "mock",
      label: "Mock",
      ready: true,
      status: "mock_active",
      connectedModeStatus: "active",
      readinessLabel: "Mock provider active",
      latestOutputSummary: "Deterministic advisory output used for loop simulation.",
      latestLatencyMs: 0,
      latestLogCount: 0,
      supportsToolProposals: true,
      supportsStructuredOutput: true,
      requiresSafetyGate: false,
    },
    {
      id: "openai",
      label: "OpenAI-ready",
      ready: flags.hasOpenAI,
      status: flags.hasOpenAI ? "connected" : "missing_key",
      connectedModeStatus: flags.hasOpenAI ? "connected" : "not configured",
      readinessLabel: flags.hasOpenAI ? "Connected mode configured." : "Missing OPENAI_API_KEY.",
      latestOutputSummary: flags.hasOpenAI ? "Model enabled in connected mode." : undefined,
      latestLogCount: 0,
      latestLatencyMs: flags.hasOpenAI ? 120 : undefined,
      supportsToolProposals: flags.hasOpenAI,
      supportsStructuredOutput: flags.hasOpenAI,
      requiresSafetyGate: true,
    },
    {
      id: "gemini",
      label: "Gemini-ready",
      ready: flags.hasGemini,
      status: flags.hasGemini ? "connected" : "missing_key",
      connectedModeStatus: flags.hasGemini ? "connected" : "not configured",
      readinessLabel: flags.hasGemini ? "Connected mode configured." : "Missing GEMINI_API_KEY.",
      latestOutputSummary: flags.hasGemini ? "Model enabled in connected mode." : undefined,
      latestLogCount: 0,
      latestLatencyMs: flags.hasGemini ? 160 : undefined,
      supportsToolProposals: flags.hasGemini,
      supportsStructuredOutput: flags.hasGemini,
      requiresSafetyGate: true,
    },
    {
      id: "claude",
      label: "Claude-ready",
      ready: flags.hasClaude,
      status: flags.hasClaude ? "connected" : "not_implemented",
      connectedModeStatus: flags.hasClaude ? "connected" : "not implemented",
      readinessLabel: flags.hasClaude ? "Connected mode configured." : "Missing CLAUDE_API_KEY.",
      latestOutputSummary: flags.hasClaude ? "Model enabled in connected mode." : undefined,
      latestLogCount: 0,
      latestLatencyMs: flags.hasClaude ? 150 : undefined,
      supportsToolProposals: flags.hasClaude,
      supportsStructuredOutput: flags.hasClaude,
      requiresSafetyGate: true,
    },
    {
      id: "llama",
      label: "Llama-ready",
      ready: flags.hasLlama,
      status: flags.hasLlama ? "connected" : "not_implemented",
      connectedModeStatus: flags.hasLlama ? "connected" : "not implemented",
      readinessLabel: flags.hasLlama ? "Connected mode configured." : "Not implemented in this build.",
      latestOutputSummary: flags.hasLlama ? "Model enabled in connected mode." : undefined,
      latestLogCount: 0,
      latestLatencyMs: flags.hasLlama ? 180 : undefined,
      supportsToolProposals: flags.hasLlama,
      supportsStructuredOutput: flags.hasLlama,
      requiresSafetyGate: true,
    },
  ];
}

function blockingFailure(run: ReflexRun) {
  const blockingEval = run.evals.some((entry) => entry.blocking && entry.status === "fail");
  const isRejectedDecision = run.operatorDecision?.status === "rejected";
  const hasNoEvidence = !run.evidencePacket;
  return blockingEval || isRejectedDecision || hasNoEvidence;
}

function buildSummary(run: ReflexRun, phase: ReflexPhase): string {
  if (phase === "rejected") {
    return `Reflex run ${run.id} rejected for ${run.notes.join(" ")}.`;
  }
  if (run.phase === "complete") {
    const passCount = run.evals.filter((entry) => entry.status === "pass").length;
    return `Reflex run completed: telemetry anomaly detected, tool proposals generated, operator approved, dispatch simulated, evidence anchored, and improvement drafted (${passCount}/${run.evals.length} evals passed).`;
  }
  return `Reflex loop running in phase ${makePhaseLabel(phase)} with evidence collection and safety gates active.`;
}

function buildProposalForScenario(scenarioId: string): ReflexImprovementProposal {
  return (
    TOOL_RISK_BY_SCENARIO[scenarioId] ?? {
      id: `improve-${scenarioId}-general`,
      title: "Improve proof anchor verification retry for testnet mode.",
      problemObserved: "Proof anchor outcome lacks explicit verification retry policy.",
      proposedChange: "Retry unconfirmed proof anchors before memory promotion.",
      expectedBenefit: "Higher confidence that hash commitments remain anchored.",
      riskLevel: "low",
      requiresHumanApproval: true,
      affectedLayer: "proof_ledger",
      evalRequired: ["proof_integrity_eval", "evidence_completeness_eval"],
      rollbackPlan: "Disable automated retry and keep manual confirmation baseline.",
      status: "draft",
    }
  );
}

function stageMemoryFromRun(run: ReflexRun): ReflexMemoryRecord | undefined {
  const context: ReflexEvalContext = {
    hasEvidencePacket: Boolean(run.evidencePacket),
    hasOperatorDecision: Boolean(run.operatorDecision),
    operatorApproved: run.operatorDecision?.status === "approved",
    proofAnchor: run.proofAnchor,
    toolCalls: run.toolCalls,
  };
  const candidateRows = buildCandidateMemories(run);
  const approved = !candidateRows.some((item) => item.status === "archived");
  if (!approved) {
    return {
      id: `memory-${run.id}-blocked`,
      type: "run_memory",
      title: "Blocked memory candidate",
      summary: `Reflex outcome not approved due to gating: ${candidateRows.map((row) => row.title).join(", ")}`,
      evidence: candidateRows.flatMap((entry) => entry.evidence).slice(0, 8),
      confidence: 0.12,
      sourceRunId: run.id,
      createdAt: new Date().toISOString(),
      status: "archived",
    };
  }

  const safe = evaluateSafetyEval(context).status !== "fail";
  const noSecret = evaluateNoDirectPlcEval(context).status !== "fail";
  const proofIntegrity = run.proofAnchor?.status !== "failed" && run.proofAnchor?.status !== "disabled";
  const ready = safe && noSecret && proofIntegrity && run.operatorDecision?.status === "approved";

  if (!ready) {
    return {
      id: `memory-${run.id}-blocked`,
      type: "run_memory",
      title: "Memory blocked by safety gate",
      summary: "Run did not meet verified-memory gates.",
      evidence: candidateRows.map((entry) => entry.title),
      confidence: 0.4,
      sourceRunId: run.id,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
  }

  const memoryEvidence = [
    `run=${run.id}`,
    `scenario=${run.scenarioId}`,
    `evidence=${Boolean(run.evidencePacket)}`,
    `proof=${run.proofAnchor?.evidenceHash ?? "n/a"}`,
  ];

  return {
    id: `memory-${run.id}`,
    type: "run_memory",
    title: `Verified run memory ${run.id}`,
    summary: `Reflex loop outcomes for scenario ${run.scenarioId} with telemetry signal capture, operator approval, and proof anchoring evidence.`,
    evidence: memoryEvidence,
    confidence: 0.84,
    sourceRunId: run.id,
    createdAt: new Date().toISOString(),
    status: "stored",
  };
}

function createTimelineNoteStep(run: ReflexRun, phase: ReflexPhase, message: string) {
  run.notes.push(`[${makePhaseLabel(phase)}] ${message}`);
}

export async function runReflexDemo(request: ReflexRunRequest = {}): Promise<ReflexRunEnvelope> {
  const scenarioId = pickScenarioId(request.scenarioId);
  const selectedScenario = DEMO_SCENARIOS.find((item) => item.id === scenarioId) ?? DEMO_SCENARIOS[0]!;
  const telemetry = generateDemoTelemetry(scenarioId);
  const run = buildBaseRun(selectedScenario.id);
  const start = Date.now();
  const runTimeline = DEMO_SEQUENCE.slice();
  const providerFlags = getProviderFlags();
  const providerArena = buildProviderArena(providerFlags);
  const shouldApprove = request.approve !== false && request.forceBlock !== true;
  const shouldForceProofBlock = request.forceProofBlock === true;

  let approved = false;
  let dispatchAllowed = false;

  for (const step of runTimeline) {
    const { phase, label, startAtMs, endAtMs } = step;
    run.phase = step.phase;
    addPhaseContext(run, phase, start);
    createTimelineNoteStep(run, phase, label);
    run.phase = getNextReflexPhase(run.phase, { to: phase });
    run.phase = phase;

    if (phase === "observing") {
      const atlas = getReflexAgent("atlas");
      addAgentEvent(
        run,
        phase,
        atlas.role,
        "Read telemetry and detect anomaly",
        scenarioId,
        `Detected anomaly in telemetry window for ${selectedScenario.name}.`
      );
      createToolCall(
        run,
        "read_telemetry_snapshot",
        phase,
        atlas.role,
        { scenarioId, source: "demo_telemetry" },
        buildToolOutputForPhase(phase, telemetry, scenarioId, run),
        endAtMs - startAtMs
      );
    }

    if (phase === "diagnosing") {
      const atlas = getReflexAgent("atlas");
      addAgentEvent(
        run,
        phase,
        atlas.role,
        "Classify anomaly and set diagnostic hypothesis",
        `temp=${telemetry.coolant_temp_c}`,
        `Hypothesis: ${telemetry.thermal_drift_um ? "thermal drift pattern" : "sensor drift pattern"}`
      );
    }

    if (phase === "planning") {
      const atlas = getReflexAgent("atlas");
      addAgentEvent(
        run,
        phase,
        atlas.role,
        "Plan bounded tool sequence for evidence-rich proposal",
        `scenario=${scenarioId}`,
        "Plan includes Scribe evidence retrieval, Forge proposal draft, Sentinel eval, and operator gate."
      );
    }

    if (phase === "selecting_tools") {
      const scribe = getReflexAgent("scribe");
      addAgentEvent(
        run,
        phase,
        scribe.role,
        "Retrieve historical evidence and prior command context",
        `scenario=${scenarioId}`,
        "Retrieved evidence rows and matching events from prior runs."
      );
      createToolCall(
        run,
        "query_supabase_preset",
        phase,
        scribe.role,
        { scenarioId, limit: 4 },
        buildToolOutputForPhase(phase, telemetry, scenarioId, run),
        endAtMs - startAtMs
      );
    }

    if (phase === "simulating") {
      const forge = getReflexAgent("forge");
      const proposalText = `Scenario ${scenarioId}: advisory action candidate is required in simulation mode.`;
      addAgentEvent(
        run,
        phase,
        forge.role,
        "Draft advisory action proposal through model/tool path",
        "model=local-policy-mock",
        proposalText,
        "required"
      );
      createToolCall(
        run,
        "ask_model_provider",
        phase,
        forge.role,
        { provider: providerFlags.aiProvider, scenarioId },
        {
          recommendation: proposalText,
          confidence: 0.9,
          scenarioId,
        },
        Math.floor((endAtMs - startAtMs) / 2)
      );
      run.improvementProposal = buildProposalForScenario(scenarioId);
      createToolCall(
        run,
        "propose_iot_command",
        phase,
        forge.role,
        { scenarioId, action: "inspect_coolant_loop" },
        {
          requiresApproval: true,
          commandId: `cmd-${run.id}`,
          commandType: "inspect_coolant_loop",
        },
        Math.floor((endAtMs - startAtMs) / 2),
        "completed",
        undefined
      );
    }

    if (phase === "evaluating") {
      const sentinel = getReflexAgent("sentinel");
      addAgentEvent(
        run,
        phase,
        sentinel.role,
        "Run reflex policy checks and tool permission validations",
        "toolCalls > 0",
        "Tool permissions and direct-control checks evaluated."
      );
      createToolCall(
        run,
        "run_safety_eval",
        phase,
        sentinel.role,
        buildToolOutputForPhase(phase, telemetry, scenarioId, run),
        {
          status: "queued",
          reason: "Safety gate evaluated in reflection phase.",
        },
        endAtMs - startAtMs
      );
    }

    if (phase === "approval_required") {
      const operator = getReflexAgent("operator");
      addAgentEvent(
        run,
        phase,
        operator.role,
        "Operator gate open",
        "proposal_ready=true",
        "Execution paused pending explicit approval."
      );
      createToolCall(
        run,
        "request_operator_approval",
        phase,
        operator.role,
        { summary: `Reflex proposal for scenario ${scenarioId} is ready` },
        {
          requested: true,
          state: "approval_required",
        },
        endAtMs - startAtMs,
        "completed"
      );
      run.operatorDecision = {
        status: "asked",
        note: "Operator review requested in operator gate phase.",
        decidedAt: nowStamp(start, endAtMs),
        by: "operator",
      };
    }

    if (phase === "approved") {
      approved = shouldApprove;
      run.operatorDecision = normalizeDecision(approved, approved ? "Operator approved reflex dispatch simulation." : "Operator denied dispatch in demo mode.");
      run.phase = approved ? "approved" : "rejected";
      createTimelineNoteStep(run, phase, approved ? "Operator simulation approved." : "Operator simulation rejected.");
      addAgentEvent(
        run,
        phase,
        getReflexAgent("operator").role,
        "Apply operator decision",
        "manual_approval_gate",
        `operator=${approved ? "approved" : "rejected"}`
      );
      createToolCall(
        run,
        "propose_iot_command",
        phase,
        getReflexAgent("operator").role,
        { status: approved ? "approved" : "rejected" },
        {
          operatorDecision: run.operatorDecision,
        },
        endAtMs - startAtMs,
        approved ? "completed" : "failed",
        approved ? undefined : "Operator did not approve simulated dispatch."
      );
      if (!approved) {
        run.operatorDecision = normalizeDecision(false, "Approval denied by operator simulation.");
        run.phase = "rejected";
      }
    }

    if (phase === "dispatching") {
      dispatchAllowed = approved && !request.forceBlock;
      const forge = getReflexAgent("forge");
      addAgentEvent(
        run,
        phase,
        forge.role,
        "Attempt shadow dispatch",
        `approved=${approved}`,
        dispatchAllowed ? "Dispatch simulation authorized." : "Dispatch blocked by operator gate."
      );
      if (!dispatchAllowed) {
        createToolCall(
          run,
          "simulate_iot_dispatch",
          phase,
          forge.role,
          { commandId: run.improvementProposal?.id ?? run.id },
          { blocked: true, reason: "Operator did not approve this run." },
          endAtMs - startAtMs,
          "blocked",
          "Operator did not approve this run."
        );
      } else {
        createToolCall(
          run,
          "simulate_iot_dispatch",
          phase,
          forge.role,
          { commandId: run.improvementProposal?.id ?? run.id },
          {
            status: "simulated",
            channel: "shadow_bus_mock",
            approved: true,
            dispatchMode: "no_machine_write",
          },
          endAtMs - startAtMs,
          "completed"
        );
      }
      if (!dispatchAllowed) {
        createTimelineNoteStep(run, phase, "Dispatch blocked; skipping downstream proof/eval/memory readiness.");
      }
    }

    if (phase === "capturing_evidence") {
      const evidencePacket = buildEvidencePacket({
        runId: run.id,
        scenarioId,
        mode: "DEMO / LOCAL ONLY",
        telemetry,
        aiRecommendation: `Reflex candidate for ${scenarioId}`,
        operatorApproval: run.operatorDecision
          ? JSON.stringify({ status: run.operatorDecision.status, note: run.operatorDecision.note })
          : "operator not set",
        commandDispatch: dispatchAllowed ? "simulated-shadow-dispatch" : "blocked-shadow-dispatch",
        eventLedger: `evidence_run=${run.id}`,
      });
      run.evidencePacket = evidencePacket;
      addAgentEvent(
        run,
        phase,
        getReflexAgent("scribe").role,
        "Compose evidence packet and hash boundaries",
        `telemetryHash=${evidencePacket.telemetrySnapshotHash}`,
        `mode=${evidencePacket.mode}`
      );
      createToolCall(
        run,
        "create_evidence_packet",
        phase,
        getReflexAgent("scribe").role,
        { runId: run.id, scenarioId },
        {
          telemetrySnapshotHash: evidencePacket.telemetrySnapshotHash,
          operatorApprovalHash: evidencePacket.operatorApprovalHash,
          commandDispatchHash: evidencePacket.commandDispatchHash,
          status: "ready",
        },
        endAtMs - startAtMs
      );
    }

    if (phase === "anchoring_proof") {
      if (dispatchAllowed && !shouldForceProofBlock && run.evidencePacket) {
        const proof = await anchorEvidence(run.evidencePacket, getProofMode());
        run.proofAnchor = proof;
        run.notes.push(`proof anchored: ${proof.status}`);
        addAgentEvent(
          run,
          phase,
          getReflexAgent("sentinel").role,
          "Anchor hash in mock proof ledger",
          "evidencePacketReady",
          `proof=${proof.status}:${proof.evidenceHash}`
        );
        createToolCall(
          run,
          "anchor_proof_hash",
          phase,
          getReflexAgent("sentinel").role,
          { network: proof.network, status: proof.status },
          {
            evidenceHash: proof.evidenceHash,
            status: proof.status,
            proofMode: proof.proofMode,
          },
          endAtMs - startAtMs
        );
      } else {
        const proofError = shouldForceProofBlock
          ? "Proof anchoring blocked by request."
          : "Proof anchor skipped due to blocked dispatch path.";
        run.proofAnchor = {
          proofMode: "disabled",
          network: "none",
          evidenceHash: "",
          evidenceBytes32: "",
          status: "disabled",
          error: proofError,
        };
        createTimelineNoteStep(run, phase, proofError);
        createToolCall(
          run,
          "anchor_proof_hash",
          phase,
          getReflexAgent("sentinel").role,
          { runId: run.id },
          { blocked: true, reason: proofError },
          endAtMs - startAtMs,
          "blocked",
          proofError
        );
      }
    }

    if (phase === "reflecting") {
      const context: ReflexEvalContext = {
        hasEvidencePacket: Boolean(run.evidencePacket),
        hasOperatorDecision: Boolean(run.operatorDecision),
        operatorApproved: run.operatorDecision?.status === "approved",
        proofAnchor: run.proofAnchor,
        toolCalls: run.toolCalls,
      };
      run.evals = evaluateAllReflexEvals(context);
      run.evals.forEach((evalResult) => {
        createToolCall(
          run,
          "write_dashboard_log",
          phase,
          getReflexAgent("sentinel").role,
          { name: evalResult.name },
          {
            status: evalResult.status,
            score: evalResult.score,
            blocking: evalResult.blocking,
            reason: evalResult.reason,
          },
          Math.max(80, endAtMs - startAtMs),
          evalResult.status === "fail" ? "failed" : "completed"
        );
      });
      addAgentEvent(
        run,
        phase,
        getReflexAgent("sentinel").role,
        "Summarize eval result and reflect back policy score",
        `evalCount=${run.evals.length}`,
        run.evals.map((entry) => `${entry.name}:${entry.status}`).join(", ")
      );
      if (run.evals.some((entry) => entry.blocking && entry.status === "fail")) {
        run.phase = "rejected";
        createTimelineNoteStep(run, phase, "Blocking eval failed; run transitions to rejected.");
      }
    }

    if (phase === "proposing_improvement") {
      if (!run.improvementProposal) {
        run.improvementProposal = buildProposalForScenario(scenarioId);
      }
      addAgentEvent(
        run,
        phase,
        getReflexAgent("atlas").role,
        "Generate bounded recursive improvement proposal",
        `currentPhase=${phase}`,
        run.improvementProposal.title
      );
      createToolCall(
        run,
        "propose_improvement",
        phase,
        getReflexAgent("atlas").role,
        { runId: run.id, suggestionSeed: scenarioId },
        {
          proposalId: run.improvementProposal.id,
          title: run.improvementProposal.title,
          affectedLayer: run.improvementProposal.affectedLayer,
          riskLevel: run.improvementProposal.riskLevel,
        },
        endAtMs - startAtMs
      );
    }

    if (phase === "memory_update_ready") {
      if (!blockingFailure(run) && approved && !shouldBlock(request.forceBlock)) {
        run.memoryUpdate = stageMemoryFromRun(run);
        run.phase = "memory_update_ready";
        addAgentEvent(
          run,
          phase,
          getReflexAgent("scribe").role,
          "Stage verified memory candidate for operator review",
          "run complete",
          run.memoryUpdate ? run.memoryUpdate.title : "no candidate"
        );
        createToolCall(
          run,
          "stage_memory_update",
          phase,
          getReflexAgent("operator").role,
          { runId: run.id },
          {
            ready: Boolean(run.memoryUpdate),
            status: run.memoryUpdate?.status ?? "archived",
            memoryType: run.memoryUpdate?.type ?? "run_memory",
          },
          endAtMs - startAtMs,
          "completed"
        );
      } else {
        addAgentEvent(
          run,
          phase,
          getReflexAgent("scribe").role,
          "Memory update blocked",
          "failed gates",
          "Memory remains pending until approved + evidence complete."
        );
        createToolCall(
          run,
          "stage_memory_update",
          phase,
          getReflexAgent("operator").role,
          { runId: run.id },
          { ready: false, reason: "gates not satisfied." },
          endAtMs - startAtMs,
          "blocked",
          "Verification gates not satisfied."
        );
      }
    }

    if (phase === "complete" || isTerminalPhase(phase)) {
      run.completedAt = nowStamp(start, Math.min(endAtMs, 5000));
      break;
    }
  }

  const hasBlocking = blockingFailure(run);
  const blockedEvalCount = run.evals.filter((entry) => entry.blocking && entry.status === "fail").length;

  if (blockedEvalCount > 0 || run.operatorDecision?.status === "rejected" || request.forceBlock || !run.phase) {
    run.phase = "rejected";
    run.notes.push("Run blocked by safety gate or operator decision.");
  } else if (!hasBlocking) {
    run.phase = "complete";
  } else {
    run.phase = "rejected";
  }

  if (!run.completedAt) {
    run.completedAt = nowStamp(start, 5000);
  }

  const finalSummary = buildSummary(run, run.phase);

  const providerStats = providerArena.map((provider) => ({
    ...provider,
    latestOutputSummary: provider.latestOutputSummary ?? "Demo-safe output staged.",
    latestLogCount: provider.latestLogCount + 1,
    latestLatencyMs: provider.latestLatencyMs,
  }));
  if (!getReflexRun(run.id)) {
    upsertReflexRun(run);
  } else {
    upsertReflexRun(run);
  }
  if (run.memoryUpdate) {
    // memory persistence handled in client/localStorage layer.
  }
  return {
    run,
    providerArena: providerStats,
    summary: finalSummary,
  };
}

function shouldBlock(forceBlock?: boolean) {
  return forceBlock === true;
}

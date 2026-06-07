import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { addLogEvent } from "@/lib/dashboard-logs/logStore";

type PresetId =
  | "summarize_shift"
  | "explain_thermal_drift"
  | "recommend_safe_action"
  | "generate_operator_brief"
  | "inspect_missing_context"
  | "custom";

type Body = {
  preset?: PresetId;
  prompt?: string;
};

const geminiModelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const setSpindleSpeedDeclaration: FunctionDeclaration = {
  name: "set_spindle_speed",
  description: "Propose a spindle speed adjustment in the digital twin.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      rpm: {
        type: SchemaType.NUMBER,
        description: "Target spindle rpm",
      },
      reason: {
        type: SchemaType.STRING,
        description: "Operational rationale.",
      },
    },
    required: ["rpm", "reason"],
  },
};

const inspectThermalCircuitDeclaration: FunctionDeclaration = {
  name: "inspect_thermal_circuit",
  description: "Propose a safe inspection action for thermal-related risk.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      area: {
        type: SchemaType.STRING,
        description: "Equipment area to inspect",
      },
      reason: {
        type: SchemaType.STRING,
        description: "Reason for the inspection proposal",
      },
    },
    required: ["area", "reason"],
  },
};

const presetInstructions: Record<PresetId, string> = {
  summarize_shift:
    "Summarize the current simulated plant shift from telemetry and event ledger in concise operational terms.",
  explain_thermal_drift:
    "Explain why thermal drift matters in precision manufacturing and what evidence should be reviewed before taking action.",
  recommend_safe_action:
    "Recommend safe advisory-only next steps for a thermal drift incident with no direct machine control.",
  generate_operator_brief:
    "Create a short operator brief with risks, recommended checks, and next safe verification items.",
  inspect_missing_context:
    "Identify missing evidence or data fields needed before approving a maintenance or control recommendation.",
  custom: "",
};

function mockResponseForPreset(preset: PresetId, prompt: string) {
  switch (preset) {
    case "summarize_shift":
      return {
        text: "Shift summary: telemetry stayed within stable bounds for most sensors, with a mild thermal trend rising near end of cycle. No direct command is proposed in advisory mode.",
        toolCall: null,
        confidence: 0.94,
        safety: "advisory_only" as const,
      };
    case "explain_thermal_drift":
      return {
        text: "Thermal drift affects geometric stability and can shift runout. Prefer checking cooldown intervals, spindle-load history, and temperature stability before any adjustment.",
        toolCall: {
          name: "inspect_thermal_circuit",
          args: { area: "coolant_and_spindle_enclosure", reason: "Need additional thermal evidence before action." },
        },
        confidence: 0.91,
        safety: "tool_call_proposed" as const,
      };
    case "recommend_safe_action":
      return {
        text: "Recommended safe action: maintain advisory state, inspect coolant loop integrity, and stage a spindle-speed reduction proposal for operator approval.",
        toolCall: {
          name: "set_spindle_speed",
          args: { rpm: 11800, reason: "Reduce thermal loading while operator reviews trending evidence." },
        },
        confidence: 0.88,
        safety: "tool_call_proposed" as const,
      };
    case "generate_operator_brief":
      return {
        text: "Operator brief: telemetry indicates moderate drift, no hard alarm state. Next step is targeted inspection with approval before any tuned command dispatch.",
        toolCall: null,
        confidence: 0.93,
        safety: "advisory_only" as const,
      };
    case "inspect_missing_context":
      return {
        text: "Missing evidence: coolant delta history, last maintenance activity, and proof of corrective action success criteria. Requesting inspection-only recommendation is safe in this state.",
        toolCall: {
          name: "inspect_thermal_circuit",
          args: { area: "qa_measurement_trace", reason: "Need additional telemetry slices and maintenance context." },
        },
        confidence: 0.92,
        safety: "tool_call_proposed" as const,
      };
    default:
      return {
        text: prompt
          ? `Mock response to: ${prompt}`
          : "No custom prompt was supplied for mock execution.",
        toolCall: null,
        confidence: 0.72,
        safety: "unclassified" as const,
      };
  }
}

async function callGemini(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: geminiModelName,
    tools: [{
      functionDeclarations: [setSpindleSpeedDeclaration, inspectThermalCircuitDeclaration],
    }],
  });

  const systemPrompt = `You are an industrial advisory model for precision manufacturing. \
Use tool calls only for safe advisory recommendations. Never execute machine control directly.`;

  const result = await model.generateContent(`${systemPrompt}\n\nUser prompt:\n${prompt}`);
  const response = result.response;

  const calls = response.functionCalls();
  if (calls && calls.length > 0) {
    const first = calls[0];
    const args: Record<string, unknown> = typeof first.args === "object" && first.args !== null
      ? (first.args as Record<string, unknown>)
      : {};
    return {
      mode: "gemini" as const,
      model: geminiModelName,
      text:
        `Tool proposal received: ${first.name}. See structured payload for proposed action. Awaiting operator approval before any dispatch.`,
      toolCall: {
        name: first.name,
        args,
      },
      safety: "tool_call_proposed" as const,
      approvalRequired: true,
      confidence: 0.9,
    };
  }

  return {
    mode: "gemini" as const,
    model: geminiModelName,
    text: response.text(),
    toolCall: null,
    safety: "advisory_only" as const,
    approvalRequired: false,
    confidence: 0.86,
  };
}

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const startedAt = Date.now();

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    body = {};
  }

  const preset = body.preset === "summarize_shift" ||
    body.preset === "explain_thermal_drift" ||
    body.preset === "recommend_safe_action" ||
    body.preset === "generate_operator_brief" ||
    body.preset === "inspect_missing_context" ||
    body.preset === "custom"
    ? body.preset
    : "summarize_shift";

  const requestPrompt = preset === "custom" ? (body.prompt ?? "").trim() : presetInstructions[preset];
  if (!requestPrompt) {
    addLogEvent({
      source: "gemini",
      type: "gemini_query_failed",
      severity: "error",
      summary: "Gemini test request missing prompt",
      details: { preset },
      mode: "mock",
    });

    return NextResponse.json({ error: "Prompt is required for custom preset." }, { status: 400 });
  }

  const shouldMock = !process.env.GEMINI_API_KEY;
  addLogEvent({
    source: "gemini",
    type: shouldMock ? "gemini_query_simulated" : "gemini_query_started",
    severity: "info",
    summary: `Gemini test started: ${preset}`,
    details: { mode: shouldMock ? "mock" : "gemini", preset },
    mode: shouldMock ? "mock" : "connected",
  });

  try {
    if (shouldMock) {
      const mock = mockResponseForPreset(preset, requestPrompt);
      const toolCall = mock.toolCall ? { name: mock.toolCall.name, args: mock.toolCall.args } : null;
      const response = {
        promptPreset: preset,
        usedPreset: preset,
        mode: "mock" as const,
        model: "local-demo",
        responseText: mock.text,
        toolCall,
        confidence: mock.confidence,
        safetyClassification: mock.safety,
        approvalRequired: mock.safety === "tool_call_proposed",
        createdAt: new Date().toISOString(),
        durationMs: Math.max(1, Date.now() - startedAt),
      };
      return NextResponse.json(response);
    }

    const modelResult = await callGemini(requestPrompt);
    if (!modelResult) {
      return NextResponse.json({ error: "Gemini provider returned no response." }, { status: 500 });
    }

    const durationMs = Math.max(1, Date.now() - startedAt);
    const response = {
      promptPreset: preset,
      usedPreset: preset,
      model: modelResult.model,
      mode: modelResult.mode,
      responseText: modelResult.text,
      toolCall: modelResult.toolCall,
      confidence: modelResult.confidence,
      safetyClassification: modelResult.safety,
      approvalRequired: modelResult.approvalRequired,
      createdAt: new Date().toISOString(),
      durationMs,
    };

    addLogEvent({
      source: "gemini",
      type: "gemini_query_succeeded",
      severity: "success",
      summary: `Gemini test succeeded: ${preset}`,
      details: {
        mode: response.mode,
        model: response.model,
        toolCall: response.toolCall?.name ?? null,
        approvalRequired: response.approvalRequired,
      },
      durationMs,
      mode: response.mode === "gemini" ? "connected" : "mock",
    });

    if (response.toolCall) {
      addLogEvent({
        source: "gemini",
        type: "gemini_tool_call_proposed",
        severity: "warning",
        summary: `Gemini tool call proposed: ${response.toolCall.name}`,
        details: { tool: response.toolCall },
        durationMs,
        mode: "mock",
      });
      addLogEvent({
        source: "operator_gate",
        type: "gemini_tool_call_blocked_for_approval",
        severity: "warning",
        summary: `Gemini tool call blocked until operator approval: ${response.toolCall.name}`,
        details: { tool: response.toolCall.name },
        durationMs,
        mode: "mock",
      });
    }

    return NextResponse.json(response);
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    const response = mockResponseForPreset(preset, requestPrompt);
    const durationMs = Math.max(1, Date.now() - startedAt);
    addLogEvent({
      source: "gemini",
      type: "gemini_query_failed",
      severity: "error",
      summary: "Gemini query failed, falling back to mock.",
      details: { error: detail, preset },
      durationMs,
      mode: "mock",
    });
    return NextResponse.json({
      promptPreset: preset,
      usedPreset: preset,
      mode: "mock" as const,
      model: "local-demo",
      responseText: `${response.text}\n\nFallback reason: ${detail}`,
      toolCall: response.toolCall ? { name: response.toolCall.name, args: response.toolCall.args } : null,
      safetyClassification: "advisory_only" as const,
      approvalRequired: false,
      confidence: 0.64,
      createdAt: new Date().toISOString(),
      durationMs,
    });
  }
}

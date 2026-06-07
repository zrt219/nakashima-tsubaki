import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// Define tools that Gemini can use
const setSpindleSpeedDeclaration: FunctionDeclaration = {
  name: "set_spindle_speed",
  description: "Set the physical spindle speed of the CNC machine to prevent damage or optimize performance.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      rpm: {
        type: SchemaType.NUMBER,
        description: "The target RPM to set the spindle to. (Must be between 0 and 24000)",
      },
      reason: {
        type: SchemaType.STRING,
        description: "The reason why the AI is issuing this command.",
      }
    },
    required: ["rpm", "reason"],
  },
};

const triggerEmergencyStopDeclaration: FunctionDeclaration = {
  name: "trigger_emergency_stop",
  description: "Immediately halt all machine operations. Only use if catastrophic failure is imminent.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      reason: {
        type: SchemaType.STRING,
        description: "The critical reason for the E-Stop.",
      }
    },
    required: ["reason"],
  },
};

type TelemetryContext = {
  speed?: { value_numeric?: number | null };
  temp?: { value_numeric?: number | null };
  vib?: { value_numeric?: number | null };
};

type GeminiToolCallArgs = {
  reason?: unknown;
};

function clampRpm(value: number) {
  return Math.max(0, Math.min(24000, Math.round(value)));
}

function normalizeTelemetry(telemetryContext?: TelemetryContext) {
  return {
    latestSpeed: telemetryContext?.speed?.value_numeric ?? null,
    latestTemp: telemetryContext?.temp?.value_numeric ?? null,
    latestVibration: telemetryContext?.vib?.value_numeric ?? null,
    assetStatus: "ACTIVE" as const
  };
}

function getToolCallReason(args: unknown) {
  if (typeof args !== "object" || args === null || !("reason" in args)) {
    return "";
  }

  const reason = (args as GeminiToolCallArgs).reason;
  return typeof reason === "string" ? reason : "";
}

function buildDemoResponse(prompt: string, telemetryContext?: TelemetryContext, reason?: string) {
  const normalizedPrompt = prompt.toLowerCase();
  const telemetry = normalizeTelemetry(telemetryContext);
  const speed = telemetry.latestSpeed ?? 12450;
  const temp = telemetry.latestTemp ?? 20.6;
  const vibration = telemetry.latestVibration ?? 1.42;
  const rpmMatch = prompt.match(/(\d{3,5})\s*rpm/i);

  const responsePrefix = reason
    ? `LOCAL DEMO FALLBACK: ${reason}\n\n`
    : "LOCAL DEMO FALLBACK: Remote Gemini is unavailable, so this advisory is being generated from deterministic local rules.\n\n";

  const catastrophicRisk =
    /emergency|e-?stop|catastrophic|imminent failure|stop immediately/.test(normalizedPrompt) ||
    temp >= 95 ||
    vibration >= 0.95;

  if (catastrophicRisk) {
    const stopReason = `Critical safeguard triggered. Coolant temperature is ${temp.toFixed(1)} C and vibration is ${vibration.toFixed(2)} mm/s, which is beyond the safe demo threshold.`;
    return {
      type: "tool_call",
      source: "local_demo",
      model: "local-demo-advisor",
      functionName: "trigger_emergency_stop",
      args: { reason: stopReason },
      text: `${responsePrefix}I need to issue an emergency stop because the telemetry indicates a catastrophic condition.\n\nReasoning: ${stopReason}`
    };
  }

  const operatorRequestedSpeedChange =
    rpmMatch ||
    /set spindle|set speed|lower spindle|reduce spindle|slow down|cut rpm|decrease rpm|vibration is rising|thermal drift/i.test(normalizedPrompt);

  if (operatorRequestedSpeedChange) {
    const requestedRpm = rpmMatch ? clampRpm(Number(rpmMatch[1])) : clampRpm(speed * 0.85);
    const speedReason =
      rpmMatch
        ? `Operator requested a spindle setpoint change to ${requestedRpm} RPM.`
        : `Reducing spindle speed from ${Math.round(speed)} RPM to ${requestedRpm} RPM because vibration is elevated at ${vibration.toFixed(2)} mm/s.`;

    return {
      type: "tool_call",
      source: "local_demo",
      model: "local-demo-advisor",
      functionName: "set_spindle_speed",
      args: { rpm: requestedRpm, reason: speedReason },
      text: `${responsePrefix}I recommend staging a spindle-speed change in the digital twin.\n\nReasoning: ${speedReason}`
    };
  }

  const advisory = [
    `${responsePrefix}Current machine state summary:`,
    `- Spindle speed: ${Math.round(speed)} RPM`,
    `- Coolant temperature: ${temp.toFixed(1)} C`,
    `- Vibration RMS: ${vibration.toFixed(2)} mm/s`,
    "",
    "Recommended next step:",
    vibration >= 0.75 || temp >= 80
      ? "Reduce feed or spindle load, inspect the bearing path, and prepare an operator-reviewed spindle-speed adjustment."
      : "Continue monitoring, review drift compensation, and inspect the next maintenance window before changing physical parameters."
  ].join("\n");

  return {
    type: "text",
    source: "local_demo",
    model: "local-demo-advisor",
    text: advisory
  };
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  const telemetryContext = body?.telemetryContext as TelemetryContext | undefined;

  if (!prompt) {
    return NextResponse.json(
      {
        type: "text",
        source: "local_demo",
        model: "local-demo-advisor",
        text: "LOCAL DEMO FALLBACK: Enter an operator question or request so the advisory engine can respond."
      },
      { status: 400 }
    );
  }

  if (!genAI) {
    return NextResponse.json(
      buildDemoResponse(prompt, telemetryContext, "GEMINI_API_KEY is not configured. The advisory engine stayed in deterministic local demo mode.")
    );
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: geminiModel,
      tools: [{
        functionDeclarations: [setSpindleSpeedDeclaration, triggerEmergencyStopDeclaration]
      }]
    });

    // COST SAVING: Do not stringify massive arrays. Only send the latest state.
    const optimizedContext = normalizeTelemetry(telemetryContext);

    const fullPrompt = `
You are an expert AI agent controlling an industrial Digital Twin system (Spindle Alpha).
Here is the latest telemetry data context:
${JSON.stringify(optimizedContext, null, 2)}

User Request: ${prompt}

Analyze the situation. If the user asks to change a parameter or if you detect a critical issue that requires intervention (and the user permits it), use the provided tools to issue a control command. Otherwise, just provide a technical text response.
`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    
    // Check if Gemini wants to call a function
    const functionCalls = response.functionCalls();
    
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      return NextResponse.json({ 
        type: "tool_call",
        source: "gemini",
        model: geminiModel,
        functionName: call.name,
        args: call.args,
        text: `I have analyzed the data and need to execute a physical command: **${call.name}**\n\nReasoning: ${getToolCallReason(call.args) || "Optimizing parameters."}`
      });
    }

    return NextResponse.json({ 
      type: "text",
      source: "gemini",
      model: geminiModel,
      text: response.text() 
    });
  } catch (error: unknown) {
    console.error("Gemini API Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      buildDemoResponse(
        prompt,
        telemetryContext,
        `Remote Gemini is unavailable (${message}). The advisory engine stayed in deterministic local demo mode.`
      )
    );
  }
}

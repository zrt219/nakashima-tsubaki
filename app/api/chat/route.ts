import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

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

export async function POST(req: Request) {
  if (!genAI) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured. Add it to .env.local" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { prompt, telemetryContext } = body;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", // Use Flash to save credits instead of Pro
      tools: [{
        functionDeclarations: [setSpindleSpeedDeclaration, triggerEmergencyStopDeclaration]
      }]
    });

    // COST SAVING: Do not stringify massive arrays. Only send the latest state.
    const optimizedContext = {
      latestSpeed: telemetryContext?.speed?.value_numeric,
      latestTemp: telemetryContext?.temp?.value_numeric,
      latestVibration: telemetryContext?.vib?.value_numeric,
      assetStatus: "ACTIVE"
    };

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
        functionName: call.name,
        args: call.args,
        text: `I have analyzed the data and need to execute a physical command: **${call.name}**\n\nReasoning: ${(call.args as any).reason || "Optimizing parameters."}`
      });
    }

    return NextResponse.json({ 
      type: "text",
      text: response.text() 
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response", details: error.message },
      { status: 500 }
    );
  }
}

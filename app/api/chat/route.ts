import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

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

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Combine user prompt with live telemetry data context
    const fullPrompt = `
You are an expert AI diagnosing an industrial Digital Twin system.
Here is the latest telemetry data context for the Spindle Alpha asset:
${JSON.stringify(telemetryContext, null, 2)}

User Request: ${prompt}

Provide a concise, engineering-focused analysis.
`;

    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response", details: error.message },
      { status: 500 }
    );
  }
}

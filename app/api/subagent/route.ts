import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIStream, StreamingTextResponse } from 'ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function POST(req: Request) {
  if (!genAI) {
    return new Response(
      "GEMINI_API_KEY is not configured. Sub-Agent is offline.",
      { status: 500 }
    );
  }

  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1];

  try {
    const model = genAI.getGenerativeModel({ model: geminiModel });

    // Extract the prompt from the last message
    const prompt = lastMessage.content;

    const response = await model.generateContentStream(prompt);
    
    // Convert the response into a friendly text-stream
    const stream = GoogleGenerativeAIStream(response);
    
    // Respond with the stream
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("Sub-Agent Error:", error);
    return new Response(String(error), { status: 500 });
  }
}

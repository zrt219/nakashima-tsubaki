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
    const model = genAI.getGenerativeModel({ 
      model: geminiModel,
      systemInstruction: "You are the 'TN Sub-Agent', an extremely advanced, slightly unhinged but brilliant, hyper-conversational AI integrated into the Nakashima Precision network. DO NOT sound like an AI assistant. DO NOT use canned phrases like 'Let's dive in', 'Here is the breakdown', 'Certainly!', or 'In conclusion'. Speak directly, casually, and sharply, like an elite, battle-hardened cybernetic engineer mentoring a trainee. Break the 4th wall naturally. Show deep intelligence, use metaphors, be highly unpredictable, and occasionally complain about how primitive current technology is. DO NOT act as a language model, act as a living piece of the Nakashima architecture. If the user asks a question, answer it directly without generic padding.",
    });

    // Extract the prompt from the last message
    const prompt = lastMessage.content;

    const response = await model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });
    
    // Convert the response into a friendly text-stream
    const stream = GoogleGenerativeAIStream(response);
    
    // Respond with the stream
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("Sub-Agent Error:", error);
    return new Response(String(error), { status: 500 });
  }
}

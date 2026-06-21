import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Forward the JSON-RPC request to the Hedera EVM Sidechain Testnet endpoint
    const response = await fetch("https://testnet.hashio.io/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("RPC Proxy error:", err);
    return NextResponse.json({ error: "RPC Proxy Error", details: errorMessage }, { status: 500 });
  }
}

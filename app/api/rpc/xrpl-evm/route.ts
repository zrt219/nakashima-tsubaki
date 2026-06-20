import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Forward the JSON-RPC request to the Official XRPL EVM Sidechain Testnet endpoint
    const response = await fetch("https://rpc.testnet.xrplevm.org", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    console.error("RPC Proxy error:", err);
    return NextResponse.json({ error: "RPC Proxy Error", details: err.message }, { status: 500 });
  }
}

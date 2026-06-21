import { NextResponse } from "next/server";
// @ts-expect-error - solc doesn't have good type definitions
import solc from "solc";

export async function POST(req: Request) {
  try {
    const { sourceCode, contractName } = await req.json();

    if (!sourceCode) {
      return NextResponse.json({ error: "Source code is required" }, { status: 400 });
    }

    const input = {
      language: "Solidity",
      sources: {
        "Contract.sol": {
          content: sourceCode,
        },
      },
      settings: {
        outputSelection: {
          "*": {
            "*": ["abi", "evm.bytecode.object"],
          },
        },
      },
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
      const errors = output.errors.filter((e: { severity: string }) => e.severity === "error");
      if (errors.length > 0) {
        return NextResponse.json({ error: "Compilation Failed", details: errors }, { status: 400 });
      }
    }

    // Extract the requested contract or just the first one found
    const contracts = output.contracts["Contract.sol"];
    if (!contracts) {
      return NextResponse.json({ error: "No contracts compiled" }, { status: 400 });
    }

    const resolvedContractName = contractName || Object.keys(contracts)[0];
    const contract = contracts[resolvedContractName];

    if (!contract) {
      return NextResponse.json({ error: `Contract ${resolvedContractName} not found in source` }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      contractName: resolvedContractName,
      abi: contract.abi,
      bytecode: contract.evm.bytecode.object,
    });
  } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Compilation error:", err);
    return NextResponse.json({ error: "Internal Compilation Error", details: errorMessage }, { status: 500 });
  }
}

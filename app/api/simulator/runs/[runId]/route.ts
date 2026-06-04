import { NextResponse } from "next/server";
import { loadServerRun, persistServerRun } from "@/lib/simulator/server-store";
import type { SimulationRun } from "@/lib/simulator/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;
  const run = await loadServerRun(runId);

  if (!run) {
    return NextResponse.json({ run: null }, { status: 404 });
  }

  return NextResponse.json({ run });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;
  const body = (await request.json()) as { run?: SimulationRun } | null;

  if (!body?.run || body.run.id !== runId) {
    return NextResponse.json({ error: "Invalid run payload" }, { status: 400 });
  }

  const run = await persistServerRun(body.run);

  return NextResponse.json({ run });
}

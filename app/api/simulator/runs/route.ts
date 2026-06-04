import { NextResponse } from "next/server";
import { createServerRun, getLatestServerRun, listServerRunSummaries } from "@/lib/simulator/server-store";
import type { ScenarioInput } from "@/lib/simulator/types";
import { getSimulatorPersistenceMode } from "@/lib/simulator/persistence";

export async function GET() {
  const [summaries, latestRun] = await Promise.all([
    listServerRunSummaries(),
    getLatestServerRun()
  ]);

  return NextResponse.json({
    persistenceMode: getSimulatorPersistenceMode(),
    summaries,
    latestRun
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { input?: ScenarioInput } | null;
  const run = await createServerRun(body?.input);

  return NextResponse.json({ run }, { status: 201 });
}

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createLogEvent } from "@/lib/dashboard-logs/logStore";

export const dynamic = "force-dynamic";

type Preset =
  | "latest_telemetry"
  | "recent_events"
  | "active_scenarios"
  | "command_queue"
  | "proof_anchors"
  | "health_summary";

type SupabaseQueryPayload = {
  preset?: Preset;
  rawSql?: string;
};

type QueryResult = {
  id: string;
  safeQueryLabel: string;
  preset: string;
  status: "success" | "failed" | "simulated";
  durationMs: number;
  rowCount: number;
  columns: string[];
  rows: Array<Record<string, unknown>>;
  usedMockData: boolean;
  mockReason?: string;
  startedAt: string;
  finishedAt: string;
};

const presets: Array<{ id: Preset; label: string; requiresSchema?: boolean }> = [
  { id: "latest_telemetry", label: "Latest Telemetry" },
  { id: "recent_events", label: "Recent Event Ledger", requiresSchema: true },
  { id: "active_scenarios", label: "Active Scenarios", requiresSchema: true },
  { id: "command_queue", label: "Command Queue" },
  { id: "proof_anchors", label: "Proof Ledger Anchors", requiresSchema: true },
  { id: "health_summary", label: "Health Summary" },
];

const mockRows: Record<Preset, Array<Record<string, unknown>>> = {
  latest_telemetry: [
    {
      scenario_id: "thermal_drift",
      metric: "thermal_drift_um",
      value: 8.4,
      unit: "um",
      updated_at: new Date().toISOString(),
      mode: "DEMO"
    },
    {
      scenario_id: "vibration_anomaly",
      metric: "vibration_rms_mm_s",
      value: 3.21,
      unit: "mm/s",
      updated_at: new Date().toISOString(),
      mode: "DEMO"
    }
  ],
  recent_events: [
    {
      id: "evt-demo-1",
      type: "health_check_started",
      summary: "Demo readiness check executed.",
      severity: "info",
      created_at: new Date().toISOString(),
      mode: "DEMO"
    }
  ],
  active_scenarios: [
    { id: "thermal_drift", name: "Precision Ball Thermal Drift", type: "precision", status: "ready", mode: "DEMO" },
    { id: "vibration_anomaly", name: "Precision Roller Vibration Anomaly", type: "precision", status: "ready", mode: "DEMO" }
  ],
  command_queue: [
    {
      id: "cmd-demo-1",
      scenario_id: "thermal_drift",
      action: "inspect_coolant_loop",
      status: "approved_in_sim",
      mode: "DEMO"
    }
  ],
  proof_anchors: [
    {
      id: "proof-demo-1",
      evidence_hash: "0xabc123",
      network: "mock",
      status: "mock_anchored",
      created_at: new Date().toISOString()
    }
  ],
  health_summary: [
    {
      area: "IoT Maker",
      status: "ready",
      risk: "low",
      updated_at: new Date().toISOString()
    }
  ]
};

function buildMockResult(input: { preset: Preset; startedAt: string; endedAt: string }): QueryResult {
  const rows = mockRows[input.preset];
  return {
    id: `mock-${input.preset}-${Date.now()}`,
    safeQueryLabel: presets.find((preset) => preset.id === input.preset)?.label ?? input.preset,
    preset: input.preset,
    status: "simulated",
    durationMs: 20,
    rowCount: rows.length,
    columns: rows.length > 0 ? Object.keys(rows[0] ?? {}) : [],
    rows,
    usedMockData: true,
    mockReason: "Supabase environment variables are not configured.",
    startedAt: input.startedAt,
    finishedAt: input.endedAt,
  };
}

function blockedKeywords(text: string) {
  const blocked = [
    "insert",
    "update",
    "delete",
    "drop",
    "alter",
    "truncate",
    "create",
    "grant",
    "revoke",
    "copy",
    "execute",
  ];
  const lowered = text.toLowerCase();
  return blocked.find((keyword) => lowered.includes(keyword));
}

type AnySupabaseClient = ReturnType<typeof createClient> & { [key: string]: unknown };

async function runTelemetryPreset(client: AnySupabaseClient) {
  const { data, error } = await client
    .from("telemetry.sensor_readings")
    .select("asset_id,metric_key,value_numeric,unit,quality,timestamp")
    .order("timestamp", { ascending: false })
    .limit(20);
  return { data, error };
}

async function runRecentEventsPreset(client: AnySupabaseClient) {
  const { data, error } = await client.from("event_ledger").select("id,event_type,summary,severity,created_at").order("created_at", { ascending: false }).limit(25);
  return { data, error };
}

async function runActiveScenariosPreset(client: AnySupabaseClient) {
  const { data, error } = await client
    .from("simulation.scenario_templates")
    .select("id,name,type,description,status")
    .order("name", { ascending: true })
    .limit(25);
  return { data, error };
}

async function runCommandQueuePreset(client: AnySupabaseClient) {
  const { data, error } = await client
    .from("command_events")
    .select("id,scenario_id,action,status,requested_at,approved_at")
    .order("requested_at", { ascending: false })
    .limit(25);
  return { data, error };
}

async function runProofAnchorsPreset(client: AnySupabaseClient) {
  const { data, error } = await client
    .from("proof.anchors")
    .select("id,run_id,scenario_id,evidence_hash,network,status,proof_mode,created_at,transaction_hash,block_number,contract_address,ledger_index")
    .order("created_at", { ascending: false })
    .limit(25);
  return { data, error };
}

async function runHealthSummaryPreset(client: AnySupabaseClient) {
  const { data, error } = await client
    .from("health_checks")
    .select("id,check_name,status,notes,created_at")
    .order("created_at", { ascending: false })
    .limit(20);
  return { data, error };
}

export async function POST(req: Request) {
  const startedAt = new Date().toISOString();
  const start = performance.now();

  let payload: SupabaseQueryPayload;
  try {
    payload = (await req.json()) as SupabaseQueryPayload;
  } catch {
    payload = {};
  }

  const preset = payload.preset;
  if (!preset) {
    return NextResponse.json(
      { error: "preset is required", startedAt },
      { status: 400 }
    );
  }

  if (!presets.some((item) => item.id === preset)) {
    return NextResponse.json({ error: "Unknown preset", startedAt }, { status: 400 });
  }

  const blocked = payload.rawSql ? blockedKeywords(payload.rawSql) : undefined;
  if (payload.rawSql && blocked) {
    const event = createLogEvent({
      source: "supabase",
      type: "supabase_query_failed",
      severity: "warning",
      summary: `Blocked SQL token in query: ${blocked}`,
      details: { preset },
      mode: "demo"
    });
    createLogEvent({ ...event, details: { ...event.details, blocked } });
    return NextResponse.json({ error: `Blocked SQL contains forbidden keyword: ${blocked}` }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const started = new Date().toISOString();

  if (!url || !anonKey) {
    const result = buildMockResult({ preset, startedAt: started, endedAt: new Date().toISOString() });
    createLogEvent({
      source: "supabase",
      type: "supabase_query_simulated",
      severity: "warning",
      summary: `Supabase query simulated for ${preset} (missing env).`,
      mode: "mock",
      details: { preset, rows: result.rowCount }
    });
    return NextResponse.json(result);
  }

  const client = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
  }) as AnySupabaseClient;

  let rows: Array<Record<string, unknown>> = [];
  let queryError: string | null = null;

  try {
    let result:
      | {
          data:
            | Array<Record<string, unknown> | null>
            | null;
          error: { message: string } | null;
        };
    switch (preset) {
      case "latest_telemetry":
        result = await runTelemetryPreset(client);
        break;
      case "recent_events":
        result = await runRecentEventsPreset(client);
        break;
      case "active_scenarios":
        result = await runActiveScenariosPreset(client);
        break;
      case "command_queue":
        result = await runCommandQueuePreset(client);
        break;
      case "proof_anchors":
        result = await runProofAnchorsPreset(client);
        break;
      case "health_summary":
      default:
        result = await runHealthSummaryPreset(client);
        break;
    }
    if (result.error) queryError = result.error.message;
    else rows = (result.data ?? []).map((row) => (row as Record<string, unknown>));
  } catch (error: unknown) {
    queryError = error instanceof Error ? error.message : "Query execution error";
  }

  const finishedAt = new Date().toISOString();
  const durationMs = Math.round(performance.now() - start);

  if (queryError) {
    const event = createLogEvent({
      source: "supabase",
      type: "supabase_query_failed",
      severity: "error",
      summary: `Supabase query failed for ${preset}.`,
      details: { preset, error: queryError },
      mode: "blocked"
    });
    return NextResponse.json({
      id: event.id,
      safeQueryLabel: presets.find((item) => item.id === preset)?.label ?? preset,
      preset,
      status: "failed",
      durationMs,
      rowCount: 0,
      columns: [],
      rows: [],
      usedMockData: false,
      startedAt,
      finishedAt,
      error: queryError,
    });
  }

  createLogEvent({
    source: "supabase",
    type: "supabase_query_succeeded",
    severity: "success",
    summary: `Supabase query succeeded: ${preset}`,
    durationMs,
    details: { preset, rowCount: rows.length },
    mode: "connected"
  });

  return NextResponse.json({
    id: `query-${Date.now()}`,
    safeQueryLabel: presets.find((item) => item.id === preset)?.label ?? preset,
    preset,
    status: "success",
    durationMs,
    rowCount: rows.length,
    columns: rows[0] ? Object.keys(rows[0]) : [],
    rows: rows.slice(0, 100),
    usedMockData: false,
    startedAt,
    finishedAt,
  });
}


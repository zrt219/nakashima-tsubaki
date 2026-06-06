export type DashboardLogSource =
  | "iot_maker"
  | "supabase"
  | "gemini"
  | "aws_iot"
  | "proof_ledger"
  | "operator_gate"
  | "simulator"
  | "system";

export type DashboardLogMode = "mock" | "demo" | "connected" | "partial" | "blocked";

export type DashboardLogSeverity = "debug" | "info" | "success" | "warning" | "error";

export type DashboardLogEvent = {
  id: string;
  timestamp: string;
  source: DashboardLogSource;
  type: string;
  severity: DashboardLogSeverity;
  summary: string;
  details?: string;
  durationMs?: number;
  mode?: DashboardLogMode;
  metadata?: Record<string, unknown>;
};

export type DashboardLogFilter = {
  source?: DashboardLogSource;
  severity?: DashboardLogSeverity;
  mode?: DashboardLogMode;
  query?: string;
};

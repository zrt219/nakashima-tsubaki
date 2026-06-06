import type { DashboardLogEvent, DashboardLogFilter, DashboardLogMode, DashboardLogSource, DashboardLogSeverity } from "@/lib/dashboard-logs/types";

const STORAGE_KEY = "tn-ai-dashboard-logs-v1";
const MAX_LOGS = 500;

function isBrowser() {
  return typeof window !== "undefined";
}

function generateId(): string {
  const now = Date.now();
  const random = Math.random().toString(16).slice(2, 10);
  return `log-${now}-${random}`;
}

type PersistedLogEvent = DashboardLogEvent;

export type LogCreateInput = Omit<DashboardLogEvent, "id" | "timestamp"> & {
  source: DashboardLogSource;
  type: string;
  severity: DashboardLogSeverity;
  summary: string;
  mode?: DashboardLogMode;
};

export function createLogEvent(input: LogCreateInput): DashboardLogEvent {
  return {
    id: generateId(),
    timestamp: new Date().toISOString(),
    ...input,
  };
}

export function formatEventPayload(event: Partial<DashboardLogEvent>): string {
  const detail = event.details ?? {};
  return JSON.stringify(
    {
      source: event.source,
      type: event.type,
      severity: event.severity,
      summary: event.summary,
      durationMs: event.durationMs,
      mode: event.mode,
      details: detail,
      metadata: event.metadata,
    },
    null,
    2
  );
}

export function readLogs(limit?: number): DashboardLogEvent[] {
  if (!isBrowser()) return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: PersistedLogEvent[] = JSON.parse(raw);
    const normalized = parsed.filter(isLogEventLike);
    return typeof limit === "number" ? normalized.slice(0, limit) : normalized;
  } catch {
    return [];
  }
}

export function writeLogs(logs: DashboardLogEvent[]) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(0, MAX_LOGS)));
  } catch {
    // best effort only
  }
}

export function addLogEvent(input: LogCreateInput): DashboardLogEvent {
  const log = createLogEvent(input);
  const existing = readLogs();
  const next = [log, ...existing].slice(0, MAX_LOGS);
  writeLogs(next);
  return log;
}

export function clearLogs() {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // best effort
  }
}

export function filterLogs(logs: DashboardLogEvent[], filters: DashboardLogFilter): DashboardLogEvent[] {
  return logs.filter((log) => {
    if (filters.source && log.source !== filters.source) return false;
    if (filters.severity && log.severity !== filters.severity) return false;
    if (filters.mode && log.mode !== filters.mode) return false;
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const summary = (log.summary || "").toLowerCase();
      const type = (log.type || "").toLowerCase();
      const detailText = JSON.stringify(log.details || {}).toLowerCase();
      if (!(summary.includes(query) || type.includes(query) || detailText.includes(query))) {
        return false;
      }
    }
    return true;
  });
}

function isLogEventLike(value: unknown): value is PersistedLogEvent {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DashboardLogEvent>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.timestamp === "string" &&
    typeof candidate.source === "string" &&
    typeof candidate.type === "string" &&
    typeof candidate.severity === "string" &&
    ["debug", "info", "success", "warning", "error"].includes(candidate.severity) &&
    typeof candidate.summary === "string"
  );
}

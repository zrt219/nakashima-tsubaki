import type { DashboardLogEvent } from "@/lib/dashboard-logs/types";

export function formatSeverityLabel(severity: DashboardLogEvent["severity"]): string {
  return severity.toUpperCase();
}

export function formatLogSummary(event: DashboardLogEvent): string {
  const duration = typeof event.durationMs === "number" ? `${event.durationMs}ms` : null;
  const mode = event.mode ? ` | mode=${event.mode}` : "";
  const source = event.source;
  return `${source} / ${event.type} / ${event.summary}${duration ? ` / ${duration}` : ""}${mode}`;
}

export function compactLogLine(event: DashboardLogEvent): string {
  const duration = typeof event.durationMs === "number" ? ` (${event.durationMs}ms)` : "";
  return `[${event.timestamp}] ${event.summary}${duration}`;
}

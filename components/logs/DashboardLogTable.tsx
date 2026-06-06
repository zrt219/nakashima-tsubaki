"use client";

import { DashboardLogEvent } from "@/lib/dashboard-logs/types";
import { LogSeverityBadge } from "@/components/logs/LogSeverityBadge";

type Props = {
  events: DashboardLogEvent[];
  onSelect: (event: DashboardLogEvent) => void;
};

export function DashboardLogTable({ events, onSelect }: Props) {
  if (events.length === 0) {
    return <p className="border border-command-line/50 bg-black/20 p-4 text-sm text-command-muted">No dashboard logs yet.</p>;
  }

  return (
    <div className="overflow-x-auto border border-command-line/40">
      <table className="min-w-full text-left text-xs">
        <thead className="bg-black/80 text-cyan-300">
          <tr>
            <th className="py-2 pr-3">Time</th>
            <th className="py-2 pr-3">Source</th>
            <th className="py-2 pr-3">Type</th>
            <th className="py-2 pr-3">Severity</th>
            <th className="py-2 pr-3">Summary</th>
            <th className="py-2 pr-3">Mode</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr
              key={event.id}
              className="border-t border-command-line/20 hover:bg-black/30 cursor-pointer"
              onClick={() => onSelect(event)}
            >
              <td className="py-2 pr-3 text-slate-300">{event.timestamp}</td>
              <td className="py-2 pr-3 text-slate-300">{event.source}</td>
              <td className="py-2 pr-3 text-slate-200">{event.type}</td>
              <td className="py-2 pr-3"><LogSeverityBadge severity={event.severity} /></td>
              <td className="py-2 pr-3 text-slate-200">{event.summary}</td>
              <td className="py-2 pr-3 text-slate-300">{event.mode ?? "n/a"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

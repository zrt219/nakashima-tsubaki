"use client";

import { DashboardLogEvent } from "@/lib/dashboard-logs/types";
import { formatEventPayload, compactLogLine } from "@/lib/dashboard-logs/formatLog";

type Props = {
  event?: DashboardLogEvent;
  onClose: () => void;
};

export function DashboardLogDetailDrawer({ event, onClose }: Props) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm">
      <aside className="fixed right-0 top-0 h-full w-full max-w-xl border-l border-cyan-400/30 bg-command-black p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-300">Log Event</h3>
          <button
            type="button"
            className="border border-cyan-400/40 px-2 py-1 text-[10px] uppercase"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <p className="text-cyan-200">{compactLogLine(event)}</p>
          <p className="text-slate-300">Type: {event.type}</p>
          <p className="text-slate-300">Source: {event.source}</p>
          <p className="text-slate-300">Severity: {event.severity}</p>
          <p className="text-slate-300">Mode: {event.mode ?? "n/a"}</p>
          <p className="text-slate-300">Summary:</p>
          <p className="border border-command-line/50 bg-black/30 p-2 text-slate-200">{event.summary}</p>
          <p className="text-slate-300">Details:</p>
          <pre className="max-h-80 overflow-auto border border-command-line/50 bg-black/30 p-2 text-slate-200">
            {formatEventPayload(event)}
          </pre>
        </div>
      </aside>
    </div>
  );
}

"use client";

import { Panel } from "@/components/tn-command-center/command-center-primitives";

type LedgerEntry = {
  id: string;
  timestamp: string;
  source: string;
  event: string;
  detail: string;
};

export function IoTMakerEventLedger({ events }: { events: LedgerEntry[] }) {
  return (
    <Panel title="IoT Maker Event Ledger" kicker="Run evidence timeline" icon="database" accent="violet">
      <div className="space-y-2">
        {events.length === 0 && (
          <p className="text-xs text-command-muted">No local events yet. Run a test flow to populate this ledger.</p>
        )}
        {events.map((event) => (
          <article key={event.id} className="border border-command-line/50 bg-black/30 p-3">
            <div className="flex justify-between gap-2 text-[10px] uppercase tracking-widest text-cyan-300">
              <span>{event.source}</span>
              <span>{event.timestamp}</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-white">{event.event}</p>
            <p className="text-xs text-slate-300">{event.detail}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}

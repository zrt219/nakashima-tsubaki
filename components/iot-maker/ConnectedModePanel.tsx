"use client";

import { Panel } from "@/components/tn-command-center/command-center-primitives";
import { ReadinessCheckGrid } from "./ReadinessCheckGrid";
import type { ReadinessCheck } from "@/lib/iot-maker/types";

type Props = {
  checks?: ReadinessCheck[];
  envChecks?: Array<{
    key: string;
    present: boolean;
    masked: string;
    required: string;
    serverOnly: boolean;
    description: string;
  }>;
  warnings?: string[];
};

export function ConnectedModePanel({ checks = [], envChecks = [], warnings = [] }: Props) {
  return (
    <div className="grid gap-4">
      <Panel title="Connected Mode" kicker="Production-style deployment shape" icon="flow" accent="amber">
        <p className="mb-3 text-sm text-slate-300">
          Connected mode depends on AWS IoT/Supabase and operator policy. The simulator can still run in mocked connected mode when keys are absent.
        </p>
        <div className="rounded border border-amber-400/20 bg-black/20 p-3">
          <h4 className="text-xs uppercase tracking-[0.14em] text-amber-300">Gate status</h4>
          <ReadinessCheckGrid checks={checks} />
        </div>
      </Panel>

      <Panel title="Server-side Env Registry" kicker="No secrets exposed" icon="database" accent="violet">
        <div className="space-y-2">
          {envChecks.map((entry) => (
            <div key={entry.key} className="grid grid-cols-1 gap-1 border border-command-line/60 bg-black/20 p-2 text-xs md:grid-cols-[220px_1fr]">
              <span className="font-mono text-cyan-200/90">{entry.key}</span>
              <span className="text-slate-300">
                {entry.present ? "configured" : "missing"} | {entry.masked} | required: {entry.required}
              </span>
              <span className="md:col-span-2 text-[11px] text-command-muted">{entry.description}</span>
            </div>
          ))}
        </div>
      </Panel>

      {warnings.length > 0 && (
        <div className="rounded border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-100">
          <p className="font-semibold uppercase tracking-[0.16em]">Warnings</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

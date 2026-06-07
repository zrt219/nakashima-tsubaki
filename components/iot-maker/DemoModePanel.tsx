"use client";

import { Panel } from "@/components/tn-command-center/command-center-primitives";
import { CommandFlowTestRunner } from "./CommandFlowTestRunner";

export function DemoModePanel() {
  return (
    <div className="grid gap-4 lg:grid-cols-1">
      <Panel title="Demo Mode" kicker="Local execution and mock telemetry" icon="database" accent="cyan">
        <p className="mb-2 text-sm text-slate-300">
          Demo mode runs synthetic telemetry and deterministic advisory logic. No cloud-side control channels are used.
        </p>
        <ul className="space-y-2 text-xs text-command-muted">
          <li>* Scenario set is fixed to the five required commissioning test cases.</li>
          <li>* AI provider is mocked unless `AI_PROVIDER` is configured with valid keys.</li>
          <li>* Operator approval is still required by default.</li>
          <li>* Only evidence hashes are prepared for proof anchoring.</li>
        </ul>
      </Panel>
      <CommandFlowTestRunner />
    </div>
  );
}

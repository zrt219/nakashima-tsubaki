"use client";

import { CommandCenterShell } from "@/components/tn-command-center/command-center-shell";
import { GovernanceDashboard } from "@/components/tn-command-center/governance-dashboard";
import { overviewEvents } from "@/lib/tn-ai-data";

export default function GovernancePage() {
  return (
    <CommandCenterShell
      activeAreaId="governance"
      rightRail={<div className="p-4 text-command-muted font-mono text-sm">Right Rail Scaffolding...</div>}
      eventStream={overviewEvents}
    >
      <GovernanceDashboard />
    </CommandCenterShell>
  );
}

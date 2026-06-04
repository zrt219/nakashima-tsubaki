"use client";

import { CommandCenterShell } from "@/components/tn-command-center/command-center-shell";
import { overviewEvents } from "@/lib/tn-ai-data";
import { ArchitectureDashboard } from "@/components/tn-command-center/architecture-dashboard";

export default function ArchitecturePage() {
  return (
    <CommandCenterShell
      activeAreaId="architecture"
      rightRail={null}
      eventStream={overviewEvents}
    >
      <ArchitectureDashboard />
    </CommandCenterShell>
  );
}

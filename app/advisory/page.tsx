"use client";

import { CommandCenterShell } from "@/components/tn-command-center/command-center-shell";
import { overviewEvents } from "@/lib/tn-ai-data";
import { AdvisoryDashboard } from "@/components/tn-command-center/advisory-dashboard";

export default function AdvisoryPage() {
  return (
    <CommandCenterShell
      activeAreaId="advisory"
      rightRail={null}
      eventStream={overviewEvents}
    >
      <AdvisoryDashboard />
    </CommandCenterShell>
  );
}

"use client";

import { CommandCenterShell } from "@/components/tn-command-center/command-center-shell";
import { overviewEvents } from "@/lib/tn-ai-data";
import { RoadmapDashboard } from "@/components/tn-command-center/roadmap-dashboard";

export default function RoadmapPage() {
  return (
    <CommandCenterShell
      activeAreaId="roadmap"
      rightRail={<div className="p-4">Right Rail Placeholder</div>}
      eventStream={overviewEvents}
    >
      <RoadmapDashboard />
    </CommandCenterShell>
  );
}

"use client";

import { CommandCenterShell } from "@/components/tn-command-center/command-center-shell";
import { overviewEvents } from "@/lib/tn-ai-data";
import { LedgerDashboard } from "@/components/tn-command-center/ledger-dashboard";

export default function LedgerPage() {
  return (
    <CommandCenterShell
      activeAreaId="ledger"
      rightRail={null}
      eventStream={overviewEvents}
    >
      <LedgerDashboard />
    </CommandCenterShell>
  );
}

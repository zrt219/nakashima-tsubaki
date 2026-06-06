import { CommandCenterShell } from "@/components/tn-command-center/command-center-shell";
import { overviewEvents } from "@/lib/tn-ai-data";
import { DashboardLogsPage } from "@/components/logs/DashboardLogsPage";

export default function LogsPage() {
  return (
    <CommandCenterShell
      activeAreaId="logs"
      rightRail={<div className="p-4 text-sm text-command-muted">Observability rail</div>}
      eventStream={overviewEvents}
    >
      <DashboardLogsPage />
    </CommandCenterShell>
  );
}

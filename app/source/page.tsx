import { CommandCenterShell } from "@/components/tn-command-center/command-center-shell";
import { overviewEvents } from "@/lib/tn-ai-data";
import { SourcePage } from "@/components/source/SourcePage";

export default function SourcePageRoute() {
  return (
    <CommandCenterShell
      activeAreaId="source"
      rightRail={null}
      eventStream={overviewEvents}
    >
      <SourcePage />
    </CommandCenterShell>
  );
}

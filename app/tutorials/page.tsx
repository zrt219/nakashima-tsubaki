import { CommandCenterShell } from "@/components/tn-command-center/command-center-shell";
import { overviewEvents } from "@/lib/tn-ai-data";
import { TutorialsPage } from "@/components/tutorials/TutorialsPage";

export default function TutorialsPageRoute() {
  return (
    <CommandCenterShell
      activeAreaId="tutorials"
      rightRail={null}
      eventStream={overviewEvents}
    >
      <TutorialsPage />
    </CommandCenterShell>
  );
}

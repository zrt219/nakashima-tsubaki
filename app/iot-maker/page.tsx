"use client";

import { CommandCenterShell } from "@/components/tn-command-center/command-center-shell";
import { overviewEvents } from "@/lib/tn-ai-data";
import { IoTMakerCenter } from "@/components/iot-maker/IoTMakerCenter";

export default function IoTMakerPage() {
  return (
    <CommandCenterShell
      activeAreaId="iot_maker"
      rightRail={null}
      eventStream={overviewEvents}
    >
      <IoTMakerCenter />
    </CommandCenterShell>
  );
}

import { Suspense } from "react";
import { SimulatorLaunchpad } from "@/components/tn-command-center/simulator-launchpad";

export default function SimulatorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-cyan-400 font-mono text-sm animate-pulse">Initializing Simulator Core...</div>}>
      <SimulatorLaunchpad />
    </Suspense>
  );
}

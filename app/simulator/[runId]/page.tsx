import { SimulatorWorkbench } from "@/components/tn-command-center/simulator-workbench";

export default async function SimulatorRunPage({
  params
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;

  return <SimulatorWorkbench runId={runId} />;
}

import { CommandCenterShell } from "@/components/tn-command-center/command-center-shell";
import { overviewEvents } from "@/lib/tn-ai-data";
import { OverviewDashboard } from "@/components/tn-command-center/overview-dashboard";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0; // Disable static rendering

export default async function Home() {
  const supabase = await createClient();

  const { data: asset } = await supabase
    .schema("topology")
    .from("assets")
    .select("*")
    .eq("name", "Spindle Alpha")
    .single();

  return (
    <OverviewDashboard asset={asset} />
  );
}

import { KpiDashboard } from "@/components/tn-command-center/kpi-dashboard";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0; // Disable static rendering for this dashboard

export default async function KpiPage() {
  const supabase = await createClient();

  // Fetch asset and latest telemetry
  const { data: asset } = await supabase
    .schema("topology")
    .from("assets")
    .select("id, name")
    .eq("name", "Spindle Alpha")
    .single();

  let telemetryData: { metric_key: string; value_numeric: number; timestamp: string }[] = [];

  if (asset) {
    const { data: readings } = await supabase
      .schema("telemetry")
      .from("sensor_readings")
      .select("metric_key, value_numeric, timestamp")
      .eq("asset_id", asset.id)
      .order("timestamp", { ascending: false })
      .limit(300);
      
    if (readings) {
      telemetryData = readings;
    }
  }

  return <KpiDashboard telemetryData={telemetryData} />;
}

import { OverviewDashboard } from "@/components/tn-command-center/overview-dashboard";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60; // Enable 1-minute ISR caching for supreme efficiency

export default async function Home() {
  const supabase = await createClient();

  const { data: asset } = await supabase
    .schema("topology")
    .from("assets")
    .select("*")
    .eq("name", "Spindle Alpha")
    .single();

  const [
    { data: speedData },
    { data: tempData },
    { data: vibData },
    { data: scenarios }
  ] = await Promise.all([
    supabase.schema("telemetry").from("sensor_readings").select("value_numeric, unit, quality").eq("asset_id", asset?.id).eq("metric_key", "spindle_speed_rpm").order("timestamp", { ascending: false }).limit(1).single(),
    supabase.schema("telemetry").from("sensor_readings").select("value_numeric, unit, quality").eq("asset_id", asset?.id).eq("metric_key", "coolant_temp_c").order("timestamp", { ascending: false }).limit(1).single(),
    supabase.schema("telemetry").from("sensor_readings").select("value_numeric, unit, quality").eq("asset_id", asset?.id).eq("metric_key", "vibration_rms_mm_s").order("timestamp", { ascending: false }).limit(1).single(),
    supabase.schema("simulation").from("scenario_templates").select("id, name, type, description").order("name").limit(5)
  ]);

  const telemetryData = {
    speed: speedData,
    temp: tempData,
    vib: vibData
  };

  return (
    <OverviewDashboard asset={asset} telemetryData={telemetryData} scenarios={scenarios || []} />
  );
}

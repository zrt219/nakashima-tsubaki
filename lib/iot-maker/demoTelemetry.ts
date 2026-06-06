// lib/iot-maker/demoTelemetry.ts

export const DEMO_TELEMETRY_KEYS = [
  "spindle_speed_rpm",
  "coolant_temp_c",
  "thermal_drift_um",
  "vibration_rms_mm_s",
  "roller_roundness_delta_um",
  "ball_surface_defect_ppm",
  "blower_pressure_kpa",
  "qa_hold_status",
  "edge_latency_ms",
  "mqtt_command_status",
] as const;

export type DemoTelemetryKey = (typeof DEMO_TELEMETRY_KEYS)[number];

export const DEMO_SCENARIOS = [
  {
    id: "thermal_drift",
    name: "Precision Ball Thermal Drift",
    description: "Coolant temperature rise causing spindle thermal expansion beyond 2 µm tolerance. AI proposes cooling cycle adjustment.",
    telemetryKeys: ["spindle_speed_rpm", "coolant_temp_c", "thermal_drift_um"],
  },
  {
    id: "vibration_anomaly",
    name: "Precision Roller Vibration Anomaly",
    description: "Vibration RMS spiking above 0.8 mm/s on roller grinding axis. AI recommends spindle speed reduction.",
    telemetryKeys: ["spindle_speed_rpm", "vibration_rms_mm_s", "roller_roundness_delta_um"],
  },
  {
    id: "blower_deviation",
    name: "Blower Throughput Deviation",
    description: "Blower pressure dropped 15% below setpoint. AI recommends inspection before next production cycle.",
    telemetryKeys: ["blower_pressure_kpa", "edge_latency_ms", "mqtt_command_status"],
  },
  {
    id: "quality_hold",
    name: "Machine Tool Quality Hold",
    description: "Ball surface defect PPM exceeded threshold. Operator approval required before releasing batch.",
    telemetryKeys: ["ball_surface_defect_ppm", "qa_hold_status", "spindle_speed_rpm"],
  },
  {
    id: "traceability_gap",
    name: "Bearing Component Traceability Gap",
    description: "Roller batch missing provenance record. Proof ledger anchor requested to close evidence chain.",
    telemetryKeys: ["roller_roundness_delta_um", "qa_hold_status", "mqtt_command_status"],
  },
] as const;

export function generateDemoTelemetry(scenarioId?: string): Record<DemoTelemetryKey, number | string> {
  const base: Record<DemoTelemetryKey, number | string> = {
    spindle_speed_rpm: 12450 + Math.round((Math.random() - 0.5) * 400),
    coolant_temp_c: 21.2 + (Math.random() * 2),
    thermal_drift_um: 0.8 + (Math.random() * 1.4),
    vibration_rms_mm_s: 0.42 + (Math.random() * 0.4),
    roller_roundness_delta_um: 0.3 + (Math.random() * 0.5),
    ball_surface_defect_ppm: Math.round(40 + Math.random() * 30),
    blower_pressure_kpa: 98.5 + (Math.random() * 3 - 1.5),
    qa_hold_status: "OK",
    edge_latency_ms: Math.round(12 + Math.random() * 20),
    mqtt_command_status: "idle",
  };

  if (scenarioId === "thermal_drift") {
    base.coolant_temp_c = 28.4 + (Math.random() * 3);
    base.thermal_drift_um = 2.3 + (Math.random() * 0.8);
  } else if (scenarioId === "vibration_anomaly") {
    base.vibration_rms_mm_s = 0.85 + (Math.random() * 0.3);
    base.roller_roundness_delta_um = 1.1 + (Math.random() * 0.4);
  } else if (scenarioId === "blower_deviation") {
    base.blower_pressure_kpa = 83.4 + (Math.random() * 4);
  } else if (scenarioId === "quality_hold") {
    base.ball_surface_defect_ppm = Math.round(280 + Math.random() * 120);
    base.qa_hold_status = "HOLD";
  } else if (scenarioId === "traceability_gap") {
    base.roller_roundness_delta_um = 1.8 + (Math.random() * 0.3);
    base.qa_hold_status = "TRACEABILITY_GAP";
  }

  return base;
}

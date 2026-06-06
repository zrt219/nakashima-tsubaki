// lib/iot-maker/topology.ts

export const TOPOLOGY_NODES = [
  { id: "sensors",     label: "Physical Sensors",       layer: "physical",   x: 10, y: 50 },
  { id: "aws_iot",     label: "AWS IoT Core",           layer: "transport",  x: 30, y: 50 },
  { id: "edge_bridge", label: "Edge Bridge",            layer: "edge",       x: 50, y: 35 },
  { id: "supabase",    label: "Supabase (State + Logs)",layer: "data",       x: 50, y: 65 },
  { id: "ai_engine",   label: "AI Engine (Propose)",    layer: "ai",         x: 70, y: 35 },
  { id: "operator",    label: "Operator Gate",          layer: "human",      x: 70, y: 65 },
  { id: "proof",       label: "Proof Ledger",           layer: "proof",      x: 90, y: 50 },
];

export const TOPOLOGY_EDGES = [
  { from: "sensors",     to: "aws_iot",     label: "MQTT telemetry",         allowed: true  },
  { from: "aws_iot",     to: "edge_bridge", label: "Telemetry subscribe",    allowed: true  },
  { from: "edge_bridge", to: "supabase",    label: "State + event write",    allowed: true  },
  { from: "supabase",    to: "ai_engine",   label: "Context for prompt",     allowed: true  },
  { from: "ai_engine",   to: "operator",    label: "Structured proposal",    allowed: true  },
  { from: "operator",    to: "edge_bridge", label: "Approved command",       allowed: true  },
  { from: "edge_bridge", to: "aws_iot",     label: "Command publish",        allowed: true  },
  { from: "supabase",    to: "proof",       label: "Evidence hash anchor",   allowed: true  },
  { from: "proof",       to: "aws_iot",     label: "Control (BLOCKED)",      allowed: false },
  { from: "proof",       to: "sensors",     label: "Control (BLOCKED)",      allowed: false },
  { from: "ai_engine",   to: "aws_iot",     label: "Direct command (BLOCKED)",allowed: false },
];

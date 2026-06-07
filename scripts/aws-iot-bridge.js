const { mqtt, iot } = require('aws-iot-device-sdk-v2');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

function toPositiveInt(value, fallback, min = 1) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed >= min) return parsed;
  if (value === undefined || value === null || String(value).trim() === '') return fallback;
  return min === 0 ? 0 : Math.max(min, fallback);
}

// Supabase setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// AWS IoT Setup (requires AWS credentials in environment)
const endpoint = process.env.AWS_IOT_ENDPOINT; // e.g., "xxxxxx-ats.iot.us-east-1.amazonaws.com"
const client_id = "digital-twin-bridge-" + Math.floor(Math.random() * 100000000);
const inboundTopic = "digital-twin/spindle/telemetry";
const outboundTopic = "digital-twin/spindle/control";
const decoder = new TextDecoder("utf-8");
const TELEMETRY_FLUSH_SIZE = toPositiveInt(process.env.AWS_IOT_TELEMETRY_FLUSH_SIZE, 25, 1);
const TELEMETRY_FLUSH_INTERVAL_MS = toPositiveInt(process.env.AWS_IOT_TELEMETRY_FLUSH_INTERVAL_MS, 250, 1);
const telemetryBuffer = [];
let flushScheduled = null;

function queueSupabaseTelemetry(payload) {
  if (!supabase) return;
  if (!payload || typeof payload !== 'object') return;
  telemetryBuffer.push(payload);
  if (telemetryBuffer.length >= TELEMETRY_FLUSH_SIZE) {
    void flushTelemetryBuffer();
  }
  if (flushScheduled === null) {
    flushScheduled = setTimeout(() => {
      flushScheduled = null;
      void flushTelemetryBuffer();
    }, TELEMETRY_FLUSH_INTERVAL_MS);
  }
}

async function flushTelemetryBuffer() {
  if (!supabase || telemetryBuffer.length === 0) return;
  const payload = telemetryBuffer.splice(0, telemetryBuffer.length);
  const { error } = await supabase.from('telemetry.sensor_readings').insert(payload);
  if (error) console.error("Supabase insert error:", error);
}

function buildMessage(topicName, payload) {
  return `[${topicName}] ${JSON.stringify(payload)}`;
}

async function insertTelemetry(payload) {
  if (!supabase) return;
  if (!payload || typeof payload !== "object") return;
  if (TELEMETRY_FLUSH_SIZE <= 1) {
    const { error } = await supabase.from('telemetry.sensor_readings').insert([payload]);
    if (error) console.error("Supabase insert error:", error);
    return;
  }
  queueSupabaseTelemetry(payload);
}

async function startBridge() {
  if (!endpoint) {
    console.warn("Skipping AWS IoT connection: AWS_IOT_ENDPOINT not set in .env.local");
    return;
  }

  console.log("Connecting to AWS IoT Core:", endpoint);
  
  // Create MQTT connection using AWS credentials (IAM)
  const config = iot.AwsIotMqttConnectionConfigBuilder.new_default_builder()
    .with_endpoint(endpoint)
    .build();

  const client = new mqtt.MqttClient();
  const connection = client.new_connection(config);

  await connection.connect();
  console.log("Connected to AWS IoT!");

  // Subscribe to inbound telemetry from Edge (AWS -> Supabase)
  await connection.subscribe(inboundTopic, mqtt.QoS.AtLeastOnce, (topic, payload) => {
    try {
      const data = JSON.parse(decoder.decode(payload));
      console.log(`[AWS INBOUND] ${buildMessage(topic, data)}`);
      void insertTelemetry(data);
    } catch (error) {
      console.warn("Ignoring malformed AWS payload:", error.message);
    }
  });

  console.log(`Subscribed to topic: ${inboundTopic}`);

  // Example: Listen to Supabase for outbound control commands (Supabase -> AWS)
  if (supabase) {
    supabase
      .channel('control-commands')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'operator_actions' }, payload => {
        const command = payload.new;
        if (!command) return;
        console.log('[SUPABASE OUTBOUND] New operator action:', command);
        connection.publish(outboundTopic, JSON.stringify(command), mqtt.QoS.AtLeastOnce);
        console.log(`Published control command to ${outboundTopic}`);
      })
      .subscribe();
      
    console.log("Subscribed to Supabase operator_actions for outbound control.");
  }
}

startBridge().catch((error) => {
  console.error("AWS IoT bridge failed:", error.message);
});

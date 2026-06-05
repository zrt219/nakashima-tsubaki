const { mqtt, iot } = require('aws-iot-device-sdk-v2');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// AWS IoT Setup (requires AWS credentials in environment)
const endpoint = process.env.AWS_IOT_ENDPOINT; // e.g., "xxxxxx-ats.iot.us-east-1.amazonaws.com"
const client_id = "digital-twin-bridge-" + Math.floor(Math.random() * 100000000);

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
  const topic = "digital-twin/spindle/telemetry";
  await connection.subscribe(topic, mqtt.QoS.AtLeastOnce, async (topic, payload) => {
    const data = JSON.parse(new TextDecoder("utf-8").decode(payload));
    console.log(`[AWS INBOUND] Received telemetry on ${topic}:`, data);
    
    // Forward to Supabase
    if (supabase) {
      const { error } = await supabase.from('telemetry.sensor_readings').insert([data]);
      if (error) console.error("Supabase insert error:", error);
    }
  });

  console.log(`Subscribed to topic: ${topic}`);

  // Example: Listen to Supabase for outbound control commands (Supabase -> AWS)
  if (supabase) {
    supabase
      .channel('control-commands')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'operator_actions' }, payload => {
        console.log('[SUPABASE OUTBOUND] New operator action:', payload.new);
        const outTopic = "digital-twin/spindle/control";
        connection.publish(outTopic, JSON.stringify(payload.new), mqtt.QoS.AtLeastOnce);
        console.log(`Published control command to ${outTopic}`);
      })
      .subscribe();
      
    console.log("Subscribed to Supabase operator_actions for outbound control.");
  }
}

startBridge().catch(console.error);

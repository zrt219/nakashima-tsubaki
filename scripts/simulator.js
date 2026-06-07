const { mqtt, iot } = require('aws-iot-device-sdk-v2');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

// Configuration
const endpoint = process.env.AWS_IOT_ENDPOINT || "a164r36b79otag-ats.iot.us-east-2.amazonaws.com"; 
const certPath = path.resolve(__dirname, '../certs/certificate.pem.crt');
const keyPath = path.resolve(__dirname, '../certs/private.pem.key');
const caPath = path.resolve(__dirname, '../certs/AmazonRootCA1.pem');
const clientId = "TsubakiSpindle-Simulator-" + Math.floor(Math.random() * 100000);
const topic = "dt/spindle/telemetry";
const SLEEP_MS = Math.max(1, Number(process.env.SIMULATOR_PUBLISH_INTERVAL_MS || 100));
const MAX_MESSAGES = Math.max(1, Number(process.env.SIMULATOR_MAX_MESSAGES || 100));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function createPayload(messageId) {
  return {
    deviceId: "TsubakiSpindle",
    timestamp: Date.now(),
    speed: { value_numeric: 12000 + (Math.random() * 500 - 250) },
    temp: { value_numeric: 45.0 + (Math.random() * 5.0) },
    vib: { value_numeric: 0.10 + (Math.random() * 0.05) },
    messageId
  };
}

async function runSimulator() {
    console.log("Starting 100x Load Test Simulator...");
    console.log(`Endpoint: ${endpoint}`);
    
    if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
        console.error("ERROR: Certificates not found in ./certs/ folder. Did you run the provisioning script?");
        process.exit(1);
    }

    const configBuilder = iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder_from_path(certPath, keyPath);
    configBuilder.with_certificate_authority_from_path(undefined, caPath);
    configBuilder.with_clean_session(false);
    configBuilder.with_client_id(clientId);
    configBuilder.with_endpoint(endpoint);

    const config = configBuilder.build();
    const client = new mqtt.MqttClient();
    const connection = client.new_connection(config);

    console.log("Connecting to AWS IoT Core...");
    await connection.connect();
    console.log("Connected successfully!");

    console.log(`Publishing ${MAX_MESSAGES} messages to ${topic}...`);

    for (let messageCount = 1; messageCount <= MAX_MESSAGES; messageCount++) {
        const payload = createPayload(messageCount);
        await connection.publish(topic, JSON.stringify(payload), mqtt.QoS.AtLeastOnce);
        console.log(`[${messageCount}/${MAX_MESSAGES}] Published telemetry payload`);
        await sleep(SLEEP_MS);
    }

    console.log("Load test complete! Disconnecting...");
    await connection.disconnect();
    console.log("Disconnected.");
}

runSimulator().catch(console.error);

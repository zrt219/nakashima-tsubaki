const { createClient } = require('@supabase/supabase-js');

// These environment variables must be set in the Lambda function configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase;

exports.handler = async (event, context) => {
  console.log("Received IoT Telemetry Event:", JSON.stringify(event, null, 2));

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
    return { statusCode: 500, body: 'Configuration error' };
  }

  // Initialize Supabase client if not already initialized
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }

  try {
    // Assuming the event from AWS IoT Rule looks like:
    // { temperature: 45.2, vibration: 0.12, timestamp: 1718000000, deviceId: "TsubakiSpindle" }
    
    // We add a received_at timestamp to track when it hit the cloud
    const payload = {
      ...event,
      received_at: new Date().toISOString()
    };

    // Insert the telemetry data into the 'telemetry' table in Supabase
    const { data, error } = await supabase
      .from('telemetry')
      .insert([payload]);

    if (error) {
      console.error("Error inserting into Supabase:", error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    console.log("Successfully inserted telemetry data:", data);
    return { statusCode: 200, body: 'Success' };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};

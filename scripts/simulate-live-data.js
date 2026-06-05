const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function simulate() {
  console.log("Starting Live Telemetry Simulation...");

  // Fetch asset and sensors
  const { data: org } = await supabase.from('identity.organizations').select('id').eq('name', 'ZRT Industrial AI Lab').single();
  const { data: asset } = await supabase.from('topology.assets').select('id').eq('name', 'Spindle Alpha').single();
  
  if (!org || !asset) {
    console.error("Could not find org or asset. Have you run the migrations?");
    return;
  }

  const { data: sensors } = await supabase.from('topology.sensors').select('id, name').eq('asset_id', asset.id);
  const speedSensor = sensors.find(s => s.name === 'spindle_speed_rpm');
  const tempSensor = sensors.find(s => s.name === 'coolant_temp_c');
  const vibSensor = sensors.find(s => s.name === 'vibration_rms_mm_s');

  let tick = 0;

  setInterval(async () => {
    tick++;
    const now = new Date().toISOString();

    const speedVal = 12000 + (Math.sin(tick * 0.1) * 500) + (Math.random() * 100 - 50);
    const tempVal = 20.0 + (Math.cos(tick * 0.05) * 3) + (Math.random() * 1.5);
    const vibVal = 1.2 + (Math.sin(tick * 0.15) * 0.2) + (Math.random() * 0.3);

    const payloads = [
      {
        organization_id: org.id,
        asset_id: asset.id,
        sensor_id: speedSensor.id,
        timestamp: now,
        metric_key: 'spindle_speed_rpm',
        unit: 'RPM',
        value_numeric: speedVal,
        quality: 'GOOD',
        confidence: 0.99
      },
      {
        organization_id: org.id,
        asset_id: asset.id,
        sensor_id: tempSensor.id,
        timestamp: now,
        metric_key: 'coolant_temp_c',
        unit: 'Celsius',
        value_numeric: tempVal,
        quality: tempVal > 24 ? 'WARNING' : 'GOOD',
        confidence: 0.98
      },
      {
        organization_id: org.id,
        asset_id: asset.id,
        sensor_id: vibSensor.id,
        timestamp: now,
        metric_key: 'vibration_rms_mm_s',
        unit: 'mm/s',
        value_numeric: vibVal,
        quality: 'GOOD',
        confidence: 0.99
      }
    ];

    const { error } = await supabase.from('telemetry.sensor_readings').insert(payloads);
    if (error) {
      console.error("Error inserting telemetry:", error.message);
    } else {
      console.log(`[${now}] Inserted live telemetry reading (Tick ${tick})`);
    }
  }, 3000); // Insert new data every 3 seconds
}

simulate();

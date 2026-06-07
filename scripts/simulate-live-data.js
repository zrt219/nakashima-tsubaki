const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

function toPositiveInt(value, fallback, min = 1) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed >= min) return parsed;
  if (value === undefined || value === null || String(value).trim() === '') return fallback;
  return parsed === 0 && min === 0 ? 0 : Math.max(min, fallback);
}

function toNonNegativeInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  return fallback;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TICK_MS = toPositiveInt(process.env.IOT_SIM_TICK_MS, 3000, 1);
const MAX_TICKS = toPositiveInt(process.env.IOT_SIM_MAX_TICKS, 0, 0);
const LOG_EVERY = toNonNegativeInt(process.env.IOT_SIM_LOG_EVERY, 1);
const BATCH_SIZE = toPositiveInt(process.env.IOT_SIM_FLUSH_BATCH_SIZE, 3, 1);
const FLUSH_INTERVAL_MS = toPositiveInt(process.env.IOT_SIM_FLUSH_INTERVAL_MS, 500, 1);
const DRY_RUN = process.env.IOT_SIM_DRY_RUN === '1' || process.env.IOT_SIM_DRY_RUN === 'true';

if (!DRY_RUN && (!supabaseUrl || !supabaseKey)) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = DRY_RUN ? null : createClient(supabaseUrl, supabaseKey);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let lastFlushMs = Date.now();
const bufferedRows = [];
const FAST_LOOP = process.env.IOT_SIM_FAST_PATH === '1' || process.env.IOT_SIM_FAST_PATH === 'true';
let prngState = 0x6d2b79f5;

function nextRandom() {
  prngState = Math.imul(prngState + 0x6d2b79f5, 0x5f356495);
  return (prngState >>> 0) / 0x100000000;
}

function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function queueInsert(rows) {
  if (rows.length === 0) return;
  if (BATCH_SIZE <= 1) {
    void flushRows(rows);
    return;
  }
  bufferedRows.push(...rows);
  if (bufferedRows.length >= BATCH_SIZE) void flushRows();
  if (Date.now() - lastFlushMs >= FLUSH_INTERVAL_MS) void flushRows();
}

async function flushRows(rows = null) {
  if (!supabase || DRY_RUN) return;
  const payload = Array.isArray(rows) ? rows : bufferedRows.splice(0, bufferedRows.length);
  if (!payload.length) return;
  lastFlushMs = Date.now();
  const { error } = await supabase.from('telemetry.sensor_readings').insert(payload);
  if (error) {
    console.error('Error inserting telemetry:', error.message);
    return;
  }
}

function createPayload(orgId, assetId, sensors, now, tick) {
  const speedWave = ((tick % 1200) - 600) * 0.8;
  const tempWave = ((tick % 700) - 350) * 0.008;
  const vibWave = ((tick % 320) - 160) * 0.004;
  const noiseSpeed = (nextRandom() - 0.5);
  const noiseTemp = (nextRandom() - 0.5);
  const noiseVib = (nextRandom() - 0.5);

  const speedVal = 12000 + speedWave + (noiseSpeed * 100);
  const tempVal = clamp(20.0 + tempWave + (noiseTemp * 1.5), 18.5, 30.5);
  const vibVal = clamp(1.2 + vibWave + (noiseVib * 0.3), 0.8, 2.5);

  return [
    {
      organization_id: orgId,
      asset_id: assetId,
      sensor_id: sensors.speedSensor.id,
      timestamp: now,
      metric_key: 'spindle_speed_rpm',
      unit: 'RPM',
      value_numeric: speedVal,
      quality: 'GOOD',
      confidence: 0.99
    },
    {
      organization_id: orgId,
      asset_id: assetId,
      sensor_id: sensors.tempSensor.id,
      timestamp: now,
      metric_key: 'coolant_temp_c',
      unit: 'Celsius',
      value_numeric: tempVal,
      quality: tempVal > 24 ? 'WARNING' : 'GOOD',
      confidence: 0.98
    },
    {
      organization_id: orgId,
      asset_id: assetId,
      sensor_id: sensors.vibSensor.id,
      timestamp: now,
      metric_key: 'vibration_rms_mm_s',
      unit: 'mm/s',
      value_numeric: vibVal,
      quality: 'GOOD',
      confidence: 0.99
    }
  ];
}

async function runLoop(orgId, assetId, sensorIds) {
  let tick = 0;
  const startTs = Date.now();

  while (true) {
    const loopStart = Date.now();
    tick++;
    const now = new Date().toISOString();
    const payloads = createPayload(orgId, assetId, sensorIds, now, tick);

    if (supabase) {
      queueInsert(payloads);
    }

    if (LOG_EVERY > 0 && tick % LOG_EVERY === 0) {
      const avg = ((Date.now() - startTs) / (tick * 1000)).toFixed(2);
      const status = supabase ? 'Inserted' : 'Generated';
      console.log(`[${now}] ${status} live telemetry reading (Tick ${tick}) avg=${avg}s/tick`);
    }

    if (MAX_TICKS && tick >= MAX_TICKS) {
      console.log(`Reached simulation cap ${MAX_TICKS}. Stopping.`);
      await flushRows();
      return;
    }

    const elapsed = Date.now() - loopStart;
    const wait = Math.max(0, TICK_MS - elapsed);
    if (FAST_LOOP && TICK_MS <= 8) {
      await new Promise((resolve) => setImmediate(resolve));
    } else if (wait > 0) {
      await sleep(wait);
    }
  }
}

async function simulate() {
  console.log('Starting Live Telemetry Simulation...');

  if (DRY_RUN) {
    const dryRunSensors = {
      speedSensor: { id: 'dry-run-speed' },
      tempSensor: { id: 'dry-run-temp' },
      vibSensor: { id: 'dry-run-vibration' }
    };
    console.log('Dry-run mode active: skipping database reads/writes.');
    return runLoop('dry-run-org', 'dry-run-asset', dryRunSensors);
  }

  const { data: org } = await supabase.from('identity.organizations').select('id').eq('name', 'ZRT Industrial AI Lab').single();
  const { data: asset } = await supabase.from('topology.assets').select('id').eq('name', 'Spindle Alpha').single();

  if (!org || !asset) {
    console.error('Could not find org or asset. Have you run the migrations?');
    return;
  }

  const { data: sensors } = await supabase.from('topology.sensors').select('id, name').eq('asset_id', asset.id);
  if (!sensors || sensors.length === 0) {
    console.error('No sensors found for Spindle Alpha.');
    return;
  }

  const speedSensor = sensors.find((s) => s.name === 'spindle_speed_rpm');
  const tempSensor = sensors.find((s) => s.name === 'coolant_temp_c');
  const vibSensor = sensors.find((s) => s.name === 'vibration_rms_mm_s');

  if (!speedSensor || !tempSensor || !vibSensor) {
    console.error('Expected sensors missing: spindle_speed_rpm, coolant_temp_c, vibration_rms_mm_s');
    return;
  }

  return runLoop(org.id, asset.id, { speedSensor, tempSensor, vibSensor });
}

simulate().catch((error) => {
  console.error('Simulation failed:', error.message);
  process.exit(1);
});

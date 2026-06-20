const http = require('http');

async function testSupabase() {
  console.log('Testing Supabase queries...');
  let successCount = 0;
  for (let i = 0; i < 20; i++) {
    const start = Date.now();
    try {
      const res = await fetch('http://localhost:3000/api/iot-maker/supabase-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset: 'latest_telemetry' })
      });
      const data = await res.json();
      const isSuccess = !data.error && res.status === 200;
      if (isSuccess) successCount++;
      console.log(`[Supabase ${i+1}/20] ${res.status} (${Date.now() - start}ms) - Success: ${isSuccess}`);
    } catch(err) {
      console.log(`[Supabase ${i+1}/20] Error: ${err.message}`);
    }
  }
  console.log(`Supabase Summary: ${successCount}/20 Successful.`);
}

async function testAWS() {
  console.log('Testing AWS / Health status...');
  try {
    const res = await fetch('http://localhost:3000/api/iot-maker/health');
    const data = await res.json();
    console.log('[AWS Health] Status:', res.status);
    console.log('[AWS Health] IoT Check:', data.services?.aws_iot?.status || 'unknown');
    console.log('[AWS Health] STS Check:', data.services?.aws_sts?.status || 'unknown');
  } catch(err) {
    console.log('[AWS Health] Error:', err.message);
  }
}

async function runAll() {
  console.log('Waiting for dev server to be ready...');
  await new Promise(r => setTimeout(r, 6000)); 
  await testAWS();
  await testSupabase();
}

runAll();

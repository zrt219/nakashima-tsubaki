-- 1. Insert 10 Facilities
INSERT INTO public.facilities (name, region, timezone)
SELECT 
  'Facility ' || i, 
  (ARRAY['NA-EAST', 'NA-WEST', 'EU-CENTRAL', 'AP-SOUTH'])[floor(random()*4)+1],
  'UTC'
FROM generate_series(1, 10) as i;

-- 2. Insert 50 Workcells
INSERT INTO public.workcells (facility_id, name, operational_status)
SELECT 
  (SELECT id FROM public.facilities ORDER BY random() LIMIT 1),
  'Cell ' || i,
  (ARRAY['ONLINE', 'OFFLINE', 'MAINTENANCE'])[floor(random()*3)+1]
FROM generate_series(1, 50) as i;

-- 3. Insert 500 Equipment Assets
INSERT INTO public.equipment_assets (workcell_id, name, model, serial_number, install_date)
SELECT 
  (SELECT id FROM public.workcells ORDER BY random() LIMIT 1),
  'Asset ' || i,
  (ARRAY['Spindle-X1', 'Furnace-B', 'Lapper-99', 'Conveyor-A'])[floor(random()*4)+1],
  'SN-' || md5(random()::text),
  CURRENT_DATE - (random() * 3650)::int
FROM generate_series(1, 500) as i;

-- 4. Insert 2000 Sensors
INSERT INTO public.equipment_sensors (equipment_id, label, unit, baseline, threshold)
SELECT 
  (SELECT id FROM public.equipment_assets ORDER BY random() LIMIT 1),
  (ARRAY['Vibration', 'Temperature', 'Pressure', 'RPM', 'Flow'])[floor(random()*5)+1],
  (ARRAY['Hz', 'C', 'PSI', 'RPM', 'L/min'])[floor(random()*5)+1],
  random() * 100,
  random() * 150
FROM generate_series(1, 2000) as i;

-- 5. Insert 5 Scenarios
INSERT INTO public.scenarios (name, description, model_id, difficulty, risk_level)
VALUES 
  ('Thermal Excursion', 'Spindle overheating during high-load cut.', 'thermal-heat-field', 'Intermediate', 'Medium'),
  ('Vibration Resonance', 'Harmonic resonance detected in tool path.', 'vibration-wave-tunnel', 'Advanced', 'High'),
  ('Supply Flow Blockage', 'Coolant line pressure drop.', 'supply-chain-flow', 'Beginner', 'Low'),
  ('Tool Wear Anomaly', 'Predictive wear indicates premature failure.', 'tool-wear-geometry', 'Advanced', 'Medium'),
  ('Quality Hold', 'Dimensional out-of-tolerance on precision part.', 'qa-inspection-torus', 'Expert', 'Critical');

-- 6. Insert 100 Simulation Runs
INSERT INTO public.simulation_runs (scenario_id, current_step)
SELECT 
  (SELECT id FROM public.scenarios ORDER BY random() LIMIT 1),
  (ARRAY['IDLE', 'SIGNAL_DETECTED', 'OPERATOR_REVIEW', 'SHADOW_EXECUTION', 'EVIDENCE_CAPTURED'])[floor(random()*5)+1]
FROM generate_series(1, 100) as i;

-- 7. Insert 10,000 Telemetry Timeseries points
INSERT INTO public.telemetry_timeseries (sensor_id, run_id, reading)
SELECT 
  (SELECT id FROM public.equipment_sensors ORDER BY random() LIMIT 1),
  (SELECT id FROM public.simulation_runs ORDER BY random() LIMIT 1),
  random() * 200
FROM generate_series(1, 10000) as i;

-- 8. Insert 500 Anomaly Detections
INSERT INTO public.anomaly_detections (sensor_id, run_id, severity)
SELECT 
  (SELECT id FROM public.equipment_sensors ORDER BY random() LIMIT 1),
  (SELECT id FROM public.simulation_runs ORDER BY random() LIMIT 1),
  (ARRAY['Warning', 'Critical', 'Fatal'])[floor(random()*3)+1]
FROM generate_series(1, 500) as i;

-- 9. Insert 300 Approval Gates
INSERT INTO public.approval_gates (run_id, label, required_role, reason, status)
SELECT 
  (SELECT id FROM public.simulation_runs ORDER BY random() LIMIT 1),
  'Safety Override Review ' || i,
  (ARRAY['Operator', 'Engineer', 'Plant Manager'])[floor(random()*3)+1],
  'AI proposed intervention for critical signal.',
  (ARRAY['pending', 'approved', 'rejected'])[floor(random()*3)+1]
FROM generate_series(1, 300) as i;

-- 10. Insert 500 Evidence Packets
INSERT INTO public.evidence_packets (run_id, source_type, title, confidence, payload_hash)
SELECT 
  (SELECT id FROM public.simulation_runs ORDER BY random() LIMIT 1),
  (ARRAY['sensor', 'procedure', 'qa-record'])[floor(random()*3)+1],
  'Evidence ' || i,
  random(),
  md5(random()::text)
FROM generate_series(1, 500) as i;

-- 11. Insert 5 Swarm Agents
INSERT INTO public.swarm_agents (type, role, system_prompt, model)
VALUES 
  ('anomaly-hunter', 'Analyst', 'Hunt for anomalies', 'gpt-4o'),
  ('thermal-expert', 'Engineer', 'Analyze heat', 'gpt-4o'),
  ('vibration-analyst', 'QA', 'Inspect harmonics', 'gpt-4o'),
  ('governance-guard', 'Manager', 'Enforce compliance', 'gpt-4o'),
  ('root-cause-ai', 'Mastermind', 'Synthesize all', 'gpt-4o');

-- 12. Insert 1000 Agent Decisions
INSERT INTO public.agent_decisions (run_id, agent_id, input_context, action_taken, confidence)
SELECT 
  (SELECT id FROM public.simulation_runs ORDER BY random() LIMIT 1),
  (SELECT id FROM public.swarm_agents ORDER BY random() LIMIT 1),
  'Context trace ' || i,
  (ARRAY['Recommended override', 'Generated evidence', 'Flagged anomaly', 'Requested human approval'])[floor(random()*4)+1],
  random()
FROM generate_series(1, 1000) as i;

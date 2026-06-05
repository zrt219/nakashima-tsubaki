-- Migration 028: Massive Telemetry Seed
-- Purpose: Injects 100,000+ rows of time-series data for Spindle Alpha using generate_series.

DO $$
DECLARE
    v_org_id UUID;
    v_asset_id UUID;
    v_speed_sensor_id UUID;
    v_temp_sensor_id UUID;
    v_vib_sensor_id UUID;
    v_start_time TIMESTAMPTZ := NOW() - INTERVAL '30 days';
    -- We want ~33,334 records per sensor over 30 days.
    -- 30 days = 43200 minutes. 43200 / 33334 ≈ 1.29 minutes per record.
    v_interval INTERVAL := INTERVAL '1.29 minutes';
BEGIN
    SELECT id INTO v_org_id FROM identity.organizations WHERE name = 'ZRT Industrial AI Lab' LIMIT 1;
    SELECT id INTO v_asset_id FROM topology.assets WHERE name = 'Spindle Alpha' AND organization_id = v_org_id LIMIT 1;
    
    SELECT id INTO v_speed_sensor_id FROM topology.sensors WHERE asset_id = v_asset_id AND name = 'spindle_speed_rpm' LIMIT 1;
    SELECT id INTO v_temp_sensor_id FROM topology.sensors WHERE asset_id = v_asset_id AND name = 'coolant_temp_c' LIMIT 1;
    SELECT id INTO v_vib_sensor_id FROM topology.sensors WHERE asset_id = v_asset_id AND name = 'vibration_rms_mm_s' LIMIT 1;

    IF v_speed_sensor_id IS NOT NULL AND v_temp_sensor_id IS NOT NULL AND v_vib_sensor_id IS NOT NULL THEN
        
        -- Insert 33,334 records for Spindle Speed
        INSERT INTO telemetry.sensor_readings (
            organization_id, asset_id, sensor_id, timestamp, 
            metric_key, unit, value_numeric, quality, confidence
        )
        SELECT 
            v_org_id, v_asset_id, v_speed_sensor_id, 
            v_start_time + (seq * v_interval),
            'spindle_speed_rpm', 'RPM', 
            12000 + (sin(seq * 0.05) * 800) + (random() * 200 - 100), -- Oscillating base with noise
            'GOOD', 0.99
        FROM generate_series(1, 33334) AS seq;

        -- Insert 33,334 records for Coolant Temperature
        INSERT INTO telemetry.sensor_readings (
            organization_id, asset_id, sensor_id, timestamp, 
            metric_key, unit, value_numeric, quality, confidence
        )
        SELECT 
            v_org_id, v_asset_id, v_temp_sensor_id, 
            v_start_time + (seq * v_interval),
            'coolant_temp_c', 'Celsius', 
            20.0 + (cos(seq * 0.01) * 3) + (random() * 1.5), -- Gradual daily thermal wave
            'GOOD', 0.98
        FROM generate_series(1, 33334) AS seq;

        -- Insert 33,334 records for Vibration
        INSERT INTO telemetry.sensor_readings (
            organization_id, asset_id, sensor_id, timestamp, 
            metric_key, unit, value_numeric, quality, confidence
        )
        SELECT 
            v_org_id, v_asset_id, v_vib_sensor_id, 
            v_start_time + (seq * v_interval),
            'vibration_rms_mm_s', 'mm/s', 
            1.2 + (sin(seq * 0.1) * 0.2) + (random() * 0.3), -- Baseline noise
            'GOOD', 0.99
        FROM generate_series(1, 33334) AS seq;

        -- Create a spike at the end for the anomaly to keep it "active"
        UPDATE telemetry.sensor_readings
        SET value_numeric = 39.1, quality = 'WARNING', confidence = 0.85
        WHERE sensor_id = v_temp_sensor_id AND timestamp > NOW() - INTERVAL '5 minutes';
        
        UPDATE telemetry.sensor_readings
        SET value_numeric = 3.2, quality = 'CRITICAL', confidence = 0.91
        WHERE sensor_id = v_vib_sensor_id AND timestamp > NOW() - INTERVAL '5 minutes';

    END IF;
END $$;

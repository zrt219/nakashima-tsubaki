-- Migration 026: Seed High-Frequency Telemetry Data
-- Purpose: Injects 500 rows of time-series data for Spindle Alpha using generate_series.

DO $$
DECLARE
    v_org_id UUID;
    v_asset_id UUID;
    v_speed_sensor_id UUID;
    v_temp_sensor_id UUID;
    v_vib_sensor_id UUID;
    v_start_time TIMESTAMPTZ := NOW() - INTERVAL '24 hours';
BEGIN
    SELECT id INTO v_org_id FROM identity.organizations WHERE name = 'ZRT Industrial AI Lab' LIMIT 1;
    SELECT id INTO v_asset_id FROM topology.assets WHERE name = 'Spindle Alpha' AND organization_id = v_org_id LIMIT 1;
    
    SELECT id INTO v_speed_sensor_id FROM topology.sensors WHERE asset_id = v_asset_id AND name = 'spindle_speed_rpm' LIMIT 1;
    SELECT id INTO v_temp_sensor_id FROM topology.sensors WHERE asset_id = v_asset_id AND name = 'coolant_temp_c' LIMIT 1;
    SELECT id INTO v_vib_sensor_id FROM topology.sensors WHERE asset_id = v_asset_id AND name = 'vibration_rms_mm_s' LIMIT 1;

    IF v_speed_sensor_id IS NOT NULL AND v_temp_sensor_id IS NOT NULL AND v_vib_sensor_id IS NOT NULL THEN
        -- Insert 500 records spaced evenly over the last 24 hours
        INSERT INTO telemetry.sensor_readings (
            organization_id, asset_id, sensor_id, timestamp, 
            metric_key, unit, value_numeric, quality, confidence
        )
        SELECT 
            v_org_id, v_asset_id, v_speed_sensor_id, 
            v_start_time + (seq * INTERVAL '2.88 minutes'),
            'spindle_speed_rpm', 'RPM', 
            12000 + (sin(seq * 0.1) * 500) + (random() * 100 - 50), -- Oscillating base with noise
            'GOOD', 0.99
        FROM generate_series(1, 500) AS seq;

        INSERT INTO telemetry.sensor_readings (
            organization_id, asset_id, sensor_id, timestamp, 
            metric_key, unit, value_numeric, quality, confidence
        )
        SELECT 
            v_org_id, v_asset_id, v_temp_sensor_id, 
            v_start_time + (seq * INTERVAL '2.88 minutes'),
            'coolant_temp_c', 'Celsius', 
            22.0 + (seq * 0.02) + (random() * 2), -- Gradual increase
            'GOOD', 0.98
        FROM generate_series(1, 500) AS seq;

        INSERT INTO telemetry.sensor_readings (
            organization_id, asset_id, sensor_id, timestamp, 
            metric_key, unit, value_numeric, quality, confidence
        )
        SELECT 
            v_org_id, v_asset_id, v_vib_sensor_id, 
            v_start_time + (seq * INTERVAL '2.88 minutes'),
            'vibration_rms_mm_s', 'mm/s', 
            1.2 + (random() * 0.4), -- Baseline noise
            'GOOD', 0.99
        FROM generate_series(1, 500) AS seq;

        -- Create a spike at the end for the anomaly
        UPDATE telemetry.sensor_readings
        SET value_numeric = 38.5, quality = 'WARNING', confidence = 0.85
        WHERE sensor_id = v_temp_sensor_id AND timestamp > NOW() - INTERVAL '10 minutes';
        
        UPDATE telemetry.sensor_readings
        SET value_numeric = 2.8, quality = 'CRITICAL', confidence = 0.91
        WHERE sensor_id = v_vib_sensor_id AND timestamp > NOW() - INTERVAL '10 minutes';

    END IF;
END $$;

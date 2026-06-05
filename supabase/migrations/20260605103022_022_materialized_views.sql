-- Migration 022: Materialized Views
-- Purpose: Fast dashboard metrics rollups.
-- Dependency: 006_telemetry_base, 007_twin_base.
-- Tables Created: None (Views created).
-- Risks: View refresh blocking if concurrent is not used in production.
-- Rollback Notes: DROP MATERIALIZED VIEW ...

CREATE MATERIALIZED VIEW telemetry.hourly_sensor_rollup AS
SELECT 
    organization_id,
    sensor_id,
    date_trunc('hour', timestamp) AS hour_bucket,
    avg(value_numeric) as avg_value,
    max(value_numeric) as max_value,
    min(value_numeric) as min_value,
    count(*) as reading_count
FROM telemetry.sensor_readings
GROUP BY organization_id, sensor_id, date_trunc('hour', timestamp);

CREATE UNIQUE INDEX idx_hourly_sensor_rollup_unique ON telemetry.hourly_sensor_rollup(organization_id, sensor_id, hour_bucket);

-- Read-only diagnostics for public."bio-tesseract-telemetry".
-- Run in Supabase SQL Editor with an appropriately authorized account.
-- No row values are selected; this script does not change schema, grants, or RLS.

-- 1. Actual PostgreSQL types and nullability.
select column_name, data_type, udt_name, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'bio-tesseract-telemetry'
order by ordinal_position;

-- 2. Counts, coverage, distinct timestamps, and ordering-candidate uniqueness.
select
  count(*) as actual_row_count,
  count(*) filter (where "timestamp" is null) as null_timestamp_count,
  min("timestamp") as earliest_timestamp,
  max("timestamp") as latest_timestamp,
  count(distinct "timestamp") as distinct_non_null_timestamp_count,
  count(*) filter (where "t_seconds" is null) as null_t_seconds_count,
  min("t_seconds") as min_t_seconds,
  max("t_seconds") as max_t_seconds,
  count(distinct "t_seconds") as distinct_non_null_t_seconds_count,
  (count(*) = count("t_seconds") and count(distinct "t_seconds") = count(*)) as t_seconds_unique_candidate
from public."bio-tesseract-telemetry";

-- 3. Null counts and rates for useful initial physiology/environment fields.
select
  count(*) as actual_row_count,
  count(*) filter (where "heart_rate_bpm" is null) as heart_rate_null_count,
  count(*) filter (where "systolic_bp_mmHg" is null) as systolic_bp_null_count,
  count(*) filter (where "diastolic_bp_mmHg" is null) as diastolic_bp_null_count,
  count(*) filter (where "map_mmHg" is null) as map_null_count,
  count(*) filter (where "stroke_volume_mL" is null) as stroke_volume_null_count,
  count(*) filter (where "cardiac_output_L_min" is null) as cardiac_output_null_count,
  count(*) filter (where "ppCO2_kPa" is null) as ppco2_kpa_null_count,
  count(*) filter (where "ppCO2_ppm" is null) as ppco2_ppm_null_count,
  count(*) filter (where "cdra_efficiency_pct" is null) as cdra_efficiency_null_count,
  count(*) filter (where "voc_mg_m3" is null) as voc_null_count,
  count(*) filter (where "rel_humidity_pct" is null) as humidity_null_count
from public."bio-tesseract-telemetry";

-- 4. Numeric-text parse failures; strict numeric syntax, no unit stripping.
select
  count(*) filter (where "heart_rate_bpm" is not null and btrim("heart_rate_bpm") <> '' and btrim("heart_rate_bpm") !~ '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)([eE][+-]?[0-9]+)?$') as heart_rate_parse_failure_count,
  count(*) filter (where "systolic_bp_mmHg" is not null and btrim("systolic_bp_mmHg") <> '' and btrim("systolic_bp_mmHg") !~ '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)([eE][+-]?[0-9]+)?$') as systolic_bp_parse_failure_count,
  count(*) filter (where "diastolic_bp_mmHg" is not null and btrim("diastolic_bp_mmHg") <> '' and btrim("diastolic_bp_mmHg") !~ '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)([eE][+-]?[0-9]+)?$') as diastolic_bp_parse_failure_count,
  count(*) filter (where "stroke_volume_mL" is not null and btrim("stroke_volume_mL") <> '' and btrim("stroke_volume_mL") !~ '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)([eE][+-]?[0-9]+)?$') as stroke_volume_parse_failure_count
from public."bio-tesseract-telemetry";

-- 5. Suspicious value counts only (no underlying sensitive values returned).
select
  count(*) filter (where case when "heart_rate_bpm" ~ '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)([eE][+-]?[0-9]+)?$' then "heart_rate_bpm"::double precision < 0 else false end) as negative_heart_rate_count,
  count(*) filter (where case when "systolic_bp_mmHg" ~ '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)([eE][+-]?[0-9]+)?$' then "systolic_bp_mmHg"::double precision < 0 else false end) as negative_systolic_bp_count,
  count(*) filter (where case when "diastolic_bp_mmHg" ~ '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)([eE][+-]?[0-9]+)?$' then "diastolic_bp_mmHg"::double precision < 0 else false end) as negative_diastolic_bp_count,
  count(*) filter (where case when "stroke_volume_mL" ~ '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)([eE][+-]?[0-9]+)?$' then "stroke_volume_mL"::double precision < 0 else false end) as negative_stroke_volume_count,
  count(*) filter (where "map_mmHg" < 0) as negative_map_count
from public."bio-tesseract-telemetry";

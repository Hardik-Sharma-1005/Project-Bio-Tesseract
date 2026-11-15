# Supabase historical telemetry

## Connection and relation

The frontend uses only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from `.env.local`. The browser client is lazy-created in `lib/supabase/client.js`; it does not need a service-role key, database password, or secret key. `.env*.local` is ignored by Git.

The queried relation is exactly `public."bio-tesseract-telemetry"`, addressed with `client.schema('public').from('bio-tesseract-telemetry')`. No CSV-derived schema guessing is used. The owner-provided DDL says all columns are nullable, `timestamp` is `timestamptz`, `t_seconds` is `bigint`, and heart rate, stroke volume, systolic BP, and diastolic BP are text. Other types are not represented as verified until inspected directly in PostgreSQL.

Zero-row PostgREST selects verified the available field names across physiology, radiation, SANS, environment, circadian, and psychosocial groups. Exact environment identifiers include quoted mixed-case `ppCO2_kPa` and `ppCO2_ppm`. No crew identifier or primary key is declared. There is no verified unique ordering key.

## Current live access findings

The owner has confirmed that this exact dataset is synthetic, contains no personal health information, and is approved for public read-only display. A read-only publishable-key Data API check returned **86,400 visible rows** and two timestamped sample rows with non-null values in the selected cardiovascular measurements. This confirms that the relation is readable under its current grants/RLS; the application does not bypass RLS or use write privileges. Values remain labeled synthetic historical telemetry, separate from simulated crew readings, and are not presented as clinically validated or physically verified.

Run [`sql/telemetry-read-only-diagnostics.sql`](sql/telemetry-read-only-diagnostics.sql) in Supabase SQL Editor to inspect actual PostgreSQL types, timestamp coverage and distinctness, `t_seconds` uniqueness, null counts, numeric-text parse failures, and suspicious negative values. It returns aggregate diagnostics only, no record values, and makes no changes. The API count is the number of rows visible to the publishable-key role. The client does not inspect policy definitions or alter grants/RLS.

## Data and display rules

`lib/telemetry/schema.js` centralizes the confirmed relation, field names, units, declared types, nullability, and parsing mode. Numeric text parsing is strict: null, blank, malformed, NaN, and Infinity remain unavailable; units are not stripped; raw source fields are preserved in normalized rows. Unknown field types and categorical strings remain unchanged. Original timestamp text is retained, and valid timestamps use the instant supplied by PostgreSQL.

Historical data has no crew mapping and is never filtered by the selected astronaut. It is labeled as imported mission-level history and kept separate from simulated crew readings. The database does not declare SpO₂, respiration rate, suit oxygen reserve, suit pressure, cabin oxygen, cabin pressure, cabin temperature, core temperature, ECG, or PPG waveforms; none are mapped from other columns. Experimental risk indicators are not presented as diagnoses.

## Ordering and performance

Ordinary renders reuse a five-minute cached diagnostic rather than repeating table counts. Queries use the exact relation and explicit field selections. `timestamp` and `t_seconds` are nullable, and their combined uniqueness has not yet been verified, so the application does not claim stable full-dataset pagination. Historical summaries use one bounded latest-record query. Chart queries apply timestamp bounds in Postgres and cap results at 1,200 rows; when more rows match, the returned chart sample is bounded and may not represent every matching row. No assumption is made that 86,400 rows represent a day or one-second intervals.

## Troubleshooting

- **Not configured:** set both exact environment variable names in the frontend `.env.local` and restart Next.js.
- **No rows visible:** the request succeeded but the role sees zero rows. Check actual table count, current grants, and RLS using authorized project tools; do not infer emptiness from the browser result.
- **Permission or relation error:** confirm that the exact relation is exposed through the Data API and inspect existing grants/RLS. Do not add broad anonymous access to unreviewed personal health data.
- **Provenance review needed:** this code records the owner's confirmation for this exact relation only; other datasets still require their own review.
- **Chart sample incomplete:** the chart query is server-filtered and capped at 1,200 points. Verify a unique ordering key or establish a safe database-side aggregate before claiming complete pagination.

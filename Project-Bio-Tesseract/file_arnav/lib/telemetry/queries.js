import { DATASET_SOURCE, HISTORICAL_SUMMARY_COLUMNS, IMPORTANT_NULL_RATE_COLUMNS, TELEMETRY_COLUMNS } from './schema';

const DEFAULT_PAGE_SIZE = 1000;
const MAX_CHART_POINTS = 1200;

function tableQuery(client) {
  return client.schema(DATASET_SOURCE.relation.schema).from(DATASET_SOURCE.relation.table);
}

function validateColumns(columns) {
  const requested = [...new Set(columns)];
  if (!requested.length || requested.some(column => !TELEMETRY_COLUMNS.includes(column))) {
    throw new Error('The query requested a column outside the verified dataset field map.');
  }
  return requested;
}

function validateWindow(from, to) {
  if (!from || !to || !Number.isFinite(Date.parse(from)) || !Number.isFinite(Date.parse(to)) || Date.parse(from) > Date.parse(to)) {
    throw new Error('A valid start and end timestamp are required for a historical query.');
  }
}

function assertStableOrdering() {
  if (!DATASET_SOURCE.orderingUniqueVerified) {
    const error = new Error('Stable range pagination is disabled until t_seconds is verified unique or a database-side aggregation is available.');
    error.code = 'TELEMETRY_ORDERING_UNVERIFIED';
    throw error;
  }
}

export async function getTelemetrySample(client, { columns, limit = 10 } = {}) {
  const safeColumns = validateColumns(columns || ['timestamp', 't_seconds', 'heart_rate_bpm', 'systolic_bp_mmHg', 'diastolic_bp_mmHg']);
  const { data, error } = await tableQuery(client)
    .select(safeColumns.join(','))
    .order(DATASET_SOURCE.timestampColumn, { ascending: false, nullsFirst: false })
    .order(DATASET_SOURCE.orderingColumn, { ascending: false, nullsFirst: false })
    .limit(Math.max(1, Math.min(20, limit)));
  if (error) throw error;
  return data || [];
}

export async function getLatestTelemetry(client, { columns } = {}) {
  const safeColumns = validateColumns(columns || ['timestamp', 't_seconds', ...HISTORICAL_SUMMARY_COLUMNS]);
  const { data, error } = await tableQuery(client)
    .select(safeColumns.join(','))
    .not(DATASET_SOURCE.timestampColumn, 'is', null)
    .order(DATASET_SOURCE.timestampColumn, { ascending: false, nullsFirst: false })
    .order(DATASET_SOURCE.orderingColumn, { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function getTelemetryStats(client) {
  const base = () => tableQuery(client);
  const [countResult, nullTimestampResult, nullSecondsResult, earliestResult, latestResult] = await Promise.all([
    base().select(DATASET_SOURCE.timestampColumn, { count: 'exact', head: true }),
    base().select(DATASET_SOURCE.timestampColumn, { count: 'exact', head: true }).is(DATASET_SOURCE.timestampColumn, null),
    base().select(DATASET_SOURCE.orderingColumn, { count: 'exact', head: true }).is(DATASET_SOURCE.orderingColumn, null),
    base().select(DATASET_SOURCE.timestampColumn).not(DATASET_SOURCE.timestampColumn, 'is', null).order(DATASET_SOURCE.timestampColumn, { ascending: true, nullsFirst: false }).limit(1).maybeSingle(),
    base().select(DATASET_SOURCE.timestampColumn).not(DATASET_SOURCE.timestampColumn, 'is', null).order(DATASET_SOURCE.timestampColumn, { ascending: false, nullsFirst: false }).limit(1).maybeSingle(),
  ]);
  const failed = [countResult, nullTimestampResult, nullSecondsResult, earliestResult, latestResult].find(result => result.error);
  if (failed?.error) throw failed.error;

  const visibleRecordCount = countResult.count || 0;
  return {
    visibleRecordCount,
    nullTimestampCount: visibleRecordCount ? nullTimestampResult.count || 0 : null,
    nullTSecondsCount: visibleRecordCount ? nullSecondsResult.count || 0 : null,
    earliestTimestamp: earliestResult.data?.[DATASET_SOURCE.timestampColumn] || null,
    latestTimestamp: latestResult.data?.[DATASET_SOURCE.timestampColumn] || null,
    minTSeconds: null,
    maxTSeconds: null,
    qualityCountsAvailable: visibleRecordCount > 0,
    uniqueTSecondsVerified: false,
  };
}

export async function getImportantNullRates(client, visibleRecordCount) {
  if (!visibleRecordCount) return null;
  const results = await Promise.all(IMPORTANT_NULL_RATE_COLUMNS.map(async column => {
    const { count, error } = await tableQuery(client)
      .select(column, { count: 'exact', head: true })
      .is(column, null);
    if (error) throw error;
    return [column, { nullCount: count || 0, rate: (count || 0) / visibleRecordCount }];
  }));
  return Object.fromEntries(results);
}

export async function getTelemetryRange(client, {
  from,
  to,
  columns = TELEMETRY_COLUMNS,
  pageSize = DEFAULT_PAGE_SIZE,
  maxRecords = 100000,
} = {}) {
  validateWindow(from, to);
  assertStableOrdering();
  const safeColumns = validateColumns(columns);
  const size = Math.max(1, Math.min(DEFAULT_PAGE_SIZE, pageSize));
  const rows = [];

  for (let offset = 0; offset < maxRecords; offset += size) {
    const { data, error } = await tableQuery(client)
      .select(safeColumns.join(','))
      .gte(DATASET_SOURCE.timestampColumn, from)
      .lte(DATASET_SOURCE.timestampColumn, to)
      .order(DATASET_SOURCE.timestampColumn, { ascending: true, nullsFirst: false })
      .order(DATASET_SOURCE.orderingColumn, { ascending: true, nullsFirst: false })
      .range(offset, offset + size - 1);
    if (error) throw error;
    const page = data || [];
    rows.push(...page);
    if (page.length < size) return rows;
  }

  throw new Error(`The requested interval exceeds the ${maxRecords.toLocaleString()}-record safety limit. Narrow the time range.`);
}

export async function getTelemetryChartSample(client, {
  from,
  to,
  columns = ['timestamp', 't_seconds', 'heart_rate_bpm'],
  maximumPoints = MAX_CHART_POINTS,
} = {}) {
  validateWindow(from, to);
  // This is a bounded, database-filtered chart preview, not stable full-table
  // pagination. Equal timestamp/t_seconds pairs may still have no unique order.
  const safeColumns = validateColumns([...columns, DATASET_SOURCE.timestampColumn, DATASET_SOURCE.orderingColumn]);
  const maxRows = Math.max(2, Math.min(MAX_CHART_POINTS, maximumPoints));
  const { count, error: countError } = await tableQuery(client)
    .select(DATASET_SOURCE.timestampColumn, { count: 'exact', head: true })
    .gte(DATASET_SOURCE.timestampColumn, from)
    .lte(DATASET_SOURCE.timestampColumn, to);
  if (countError) throw countError;
  if (!count) return { rows: [], matchedRecordCount: 0, sampledRecordCount: 0, complete: true };

  const { data, error } = await tableQuery(client)
    .select(safeColumns.join(','))
    .gte(DATASET_SOURCE.timestampColumn, from)
    .lte(DATASET_SOURCE.timestampColumn, to)
    .order(DATASET_SOURCE.timestampColumn, { ascending: true, nullsFirst: false })
    .order(DATASET_SOURCE.orderingColumn, { ascending: true, nullsFirst: false })
    .limit(maxRows);
  if (error) throw error;
  return {
    rows: data || [],
    matchedRecordCount: count,
    sampledRecordCount: data?.length || 0,
    complete: count <= maxRows,
  };
}

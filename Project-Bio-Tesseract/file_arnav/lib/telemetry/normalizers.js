import { DATASET_SOURCE, TELEMETRY_FIELDS } from './schema';

const numericPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;

export function parseNumericText(value) {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || !numericPattern.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeField(value, definition) {
  if (value === null || value === undefined) return null;
  if (definition.parsing === 'numeric-text') return parseNumericText(value);
  if (definition.parsing === 'number') {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (typeof value === 'string') return parseNumericText(value);
    return null;
  }
  return value;
}

export function normalizeTelemetryRow(row) {
  if (!row || typeof row !== 'object') return null;
  const timestampOriginal = row[DATASET_SOURCE.timestampColumn] ?? null;
  const timestamp = timestampOriginal == null ? null : new Date(timestampOriginal);
  const fields = Object.fromEntries(Object.entries(TELEMETRY_FIELDS)
    .filter(([column]) => Object.hasOwn(row, column))
    .map(([column, definition]) => [column, normalizeField(row[column], definition)]));

  return {
    sourceRecordIdentifier: null,
    orderingCandidate: row[DATASET_SOURCE.orderingColumn] ?? null,
    timestampOriginal,
    timestamp: timestampOriginal !== null && timestamp && !Number.isNaN(timestamp.getTime()) ? timestamp.toISOString() : null,
    entityId: null,
    fields,
    raw: row,
  };
}

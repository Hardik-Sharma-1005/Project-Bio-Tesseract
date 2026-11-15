export function aggregateTelemetryByTime(rows, metric) {
  const timestamps = new Map();

  for (const row of rows || []) {
    const value = row?.fields?.[metric];
    const timestamp = row?.timestamp ? Date.parse(row.timestamp) : Number.NaN;
    if (!Number.isFinite(timestamp) || !Number.isFinite(value)) continue;
    const item = timestamps.get(timestamp) || { timestamp: new Date(timestamp).toISOString(), total: 0, count: 0 };
    item.total += value;
    item.count += 1;
    timestamps.set(timestamp, item);
  }

  return [...timestamps.values()]
    .sort((first, second) => first.timestamp.localeCompare(second.timestamp))
    .map(({ timestamp, total, count }) => ({ timestamp, value: total / count, sourceRecordCount: count }));
}

export function downsampleSeries(points, maximumPoints = 1200) {
  if (!Array.isArray(points) || points.length <= maximumPoints) return points || [];
  const stride = (points.length - 1) / (maximumPoints - 1);
  return Array.from({ length: maximumPoints }, (_, index) => points[Math.round(index * stride)]);
}

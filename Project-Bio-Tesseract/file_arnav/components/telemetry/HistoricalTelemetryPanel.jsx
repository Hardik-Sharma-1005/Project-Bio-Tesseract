'use client';

import { useMemo, useState } from 'react';
import { aggregateTelemetryByTime } from '../../lib/telemetry/aggregations';
import { DATASET_SOURCE, TELEMETRY_FIELDS } from '../../lib/telemetry/schema';
import { useTelemetryChart, useTelemetryDataset } from '../../hooks/useTelemetryDataset';

const GROUP_METRICS = Object.freeze({
  physiology: ['heart_rate_bpm', 'systolic_bp_mmHg', 'diastolic_bp_mmHg', 'map_mmHg', 'stroke_volume_mL', 'cardiac_output_L_min'],
  environment: ['co2_production_kg_day', 'cdra_efficiency_pct', 'ppCO2_kPa', 'ppCO2_ppm', 'voc_mg_m3', 'rel_humidity_pct', 'vibration_rms_ms2'],
});
const RANGE_OPTIONS = [
  { id: 'available', label: 'All available' },
  { id: '15m', label: 'Last 15 minutes', seconds: 900 },
  { id: '1h', label: 'Last 1 hour', seconds: 3600 },
  { id: '6h', label: 'Last 6 hours', seconds: 21600 },
  { id: '24h', label: 'Last 24 hours', seconds: 86400 },
];

const dateTime = value => {
  if (!value) return 'Unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unavailable' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'medium' }).format(date);
};
const displayValue = (value, digits = 2) => {
  if (value === null || value === undefined || value === '') return 'Unavailable';
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toFixed(digits).replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1') : String(value);
};

function SeriesChart({ points, metric }) {
  const valid = points.filter(point => Number.isFinite(point.value));
  if (!valid.length) return <p className="historical-telemetry__message">No numeric values are available in this window.</p>;
  const width = 720; const height = 210; const pad = { top: 16, right: 14, bottom: 28, left: 14 };
  const values = valid.map(point => point.value); const low = Math.min(...values); const high = Math.max(...values);
  const span = high - low || Math.max(Math.abs(high) * 0.02, 1);
  const positions = valid.map((point, index) => {
    const x = pad.left + (valid.length < 2 ? (width - pad.left - pad.right) / 2 : index * (width - pad.left - pad.right) / (valid.length - 1));
    const y = pad.top + (high - point.value) / span * (height - pad.top - pad.bottom);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const path = positions.map((point, index) => `${index ? 'L' : 'M'} ${point}`).join(' ');
  const metadata = TELEMETRY_FIELDS[metric];
  return <div className="historical-telemetry-chart">
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${metadata.label}, ${valid.length} distinct timestamp points`} preserveAspectRatio="none">
      {[0.25, 0.5, 0.75].map(y => <line key={y} x1="0" x2={width} y1={pad.top + (height - pad.top - pad.bottom) * y} y2={pad.top + (height - pad.top - pad.bottom) * y} className="historical-telemetry-chart__grid" />)}
      <path d={path} className="historical-telemetry-chart__line" />
    </svg>
    <div className="historical-telemetry-chart__axis"><span>{dateTime(valid[0]?.timestamp)}</span><span>{dateTime(valid[valid.length - 1]?.timestamp)}</span></div>
    <p>{metadata.label}: {displayValue(low)}–{displayValue(high)} {metadata.unit || ''}</p>
  </div>;
}

export default function HistoricalTelemetryPanel({ group = 'physiology', mode = 'full', onNavigate }) {
  const { dataset, isLoading, retry } = useTelemetryDataset();
  const metrics = GROUP_METRICS[group] || GROUP_METRICS.physiology;
  const [metric, setMetric] = useState(metrics[0]);
  const [rangeId, setRangeId] = useState('available');
  const selectedRange = RANGE_OPTIONS.find(option => option.id === rangeId) || RANGE_OPTIONS[0];
  const earliest = Date.parse(dataset?.stats?.earliestTimestamp || '');
  const latestTimestamp = Date.parse(dataset?.stats?.latestTimestamp || '');
  const requestedFrom = selectedRange.seconds ? latestTimestamp - selectedRange.seconds * 1000 : earliest;
  const range = Number.isFinite(earliest) && Number.isFinite(latestTimestamp)
    ? { from: new Date(Math.max(earliest, requestedFrom)).toISOString(), to: new Date(latestTimestamp).toISOString() } : { from: null, to: null };
  const chart = useTelemetryChart(dataset, range.from, range.to, metrics);
  const series = useMemo(() => aggregateTelemetryByTime(chart.points, metric), [chart.points, metric]);
  const compact = mode === 'compact';
  const visible = dataset?.status === 'ready' && dataset.displayAllowed === true;
  const count = dataset?.stats?.visibleRecordCount;
  const stateLabel = isLoading ? 'Checking' : ({ ready: 'Dataset ready', no_visible_rows: 'No rows visible', provenance_review_required: 'Provenance review needed', not_configured: 'Not configured' }[dataset?.status] || (dataset?.message ? 'Unavailable' : 'Waiting'));

  return <section className={`historical-telemetry${compact ? ' historical-telemetry--compact' : ''}`} aria-labelledby={`historical-telemetry-${group}-title`}>
    <header className="historical-telemetry__header"><div>
      <p className="overview-eyebrow">SYNTHETIC HISTORICAL TELEMETRY</p>
      <h2 id={`historical-telemetry-${group}-title`}>Historical {group === 'environment' ? 'environment' : 'telemetry'}</h2>
      <p>Owner-confirmed synthetic dataset · separate from live simulation</p>
    </div><span className={`historical-telemetry__status${visible ? ' is-ready' : ''}`} role="status" aria-live="polite"><i aria-hidden="true" />{stateLabel}</span></header>

    {isLoading && <p className="historical-telemetry__message" role="status">Checking the configured Supabase Data API…</p>}
    {!isLoading && !visible && <div className="historical-telemetry__message" role="status">
      <p>{dataset?.message || 'Historical values are not available.'}</p>
      {dataset?.status === 'not_configured' && <p>Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> in <code>.env.local</code>.</p>}
      {dataset?.status !== 'not_configured' && <button type="button" onClick={retry}>Retry connection check</button>}
    </div>}

    {visible && <>
      <div className="historical-telemetry__meta">
        <div><span>Rows visible to publishable key</span><strong>{Number(count || 0).toLocaleString()}</strong></div>
        <div><span>First timestamp</span><strong>{dateTime(dataset.stats.earliestTimestamp)}</strong></div>
        <div><span>Latest timestamp</span><strong>{dateTime(dataset.stats.latestTimestamp)}</strong></div>
        <div><span>Source relation</span><strong>{DATASET_SOURCE.relation.schema}.{DATASET_SOURCE.relation.table}</strong></div>
      </div>
      {dataset.latest?.fields && <div className="historical-telemetry__readings" aria-label="Latest synthetic historical measurements">
        {metrics.map(column => <div key={column}>
          <span>{TELEMETRY_FIELDS[column].label}</span>
          <strong>{displayValue(dataset.latest.fields[column])} <small>{TELEMETRY_FIELDS[column].unit || ''}</small></strong>
        </div>)}
      </div>}
      <p className="historical-telemetry__note">Synthetic historical values are not assigned to a crew member. The owner confirmed the dataset contains no personal health information and approved public read access. Measurements are not clinically validated or physically verified.</p>
      {!compact && <div className="historical-telemetry__chart-panel">
        <div className="historical-telemetry__controls">
          <label>Measurement<select value={metric} onChange={event => setMetric(event.target.value)}>{metrics.map(column => <option key={column} value={column}>{TELEMETRY_FIELDS[column].label} · {TELEMETRY_FIELDS[column].unit || 'index'}</option>)}</select></label>
          <label>Historical window<select value={rangeId} onChange={event => setRangeId(event.target.value)}>{RANGE_OPTIONS.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
        </div>
        {!DATASET_SOURCE.orderingUniqueVerified && <p className="historical-telemetry__message">Chart is paused until t_seconds uniqueness is verified or a safe database-side aggregation is available.</p>}
        {chart.status === 'loading' && <p className="historical-telemetry__message" role="status">Loading timestamp-filtered records…</p>}
        {chart.status === 'empty' && <p className="historical-telemetry__message">{chart.message}</p>}
        {chart.message && chart.status !== 'empty' && chart.status !== 'loading' && <p className="historical-telemetry__message" role="alert">{chart.message}</p>}
        {chart.status === 'ready' && series.length > 0 && <SeriesChart points={series} metric={metric} />}
        {chart.status === 'ready' && <p className="historical-telemetry__note">{Number(chart.matchedRecordCount).toLocaleString()} matched · {Number(chart.sampledRecordCount).toLocaleString()} chart samples. Duplicate exact timestamps are averaged; no assumed sampling interval is applied.</p>}
      </div>}
      {compact && <button type="button" className="historical-telemetry__action" onClick={() => onNavigate?.('biomonitor')}>Open historical Bio-Monitor <span aria-hidden="true">→</span></button>}
    </>}
    <p className="historical-telemetry__disclosure">Historical stored records only. Not a live sensor feed, medical assessment, or real spacecraft connection.</p>
  </section>;
}

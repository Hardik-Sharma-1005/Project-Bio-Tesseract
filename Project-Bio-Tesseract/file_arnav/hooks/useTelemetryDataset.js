'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSupabaseClient } from '../lib/supabase/client';
import { getSupabaseConfig } from '../lib/supabase/config';
import { inspectTelemetryDataset } from '../lib/telemetry/diagnostics';
import { classifySupabaseError } from '../lib/telemetry/errors';
import { getTelemetryChartSample } from '../lib/telemetry/queries';
import { TELEMETRY_COLUMNS } from '../lib/telemetry/schema';
import { normalizeTelemetryRow } from '../lib/telemetry/normalizers';

const CACHE_TTL_MS = 5 * 60_000;
let diagnosticCache = { key: null, loadedAt: 0, promise: null };

async function getCachedDiagnostic(client, config, force = false) {
  const key = `${config.url || ''}:${config.configured ? 'configured' : 'missing'}`;
  if (!force && diagnosticCache.key === key && Date.now() - diagnosticCache.loadedAt < CACHE_TTL_MS && diagnosticCache.promise) {
    return diagnosticCache.promise;
  }
  const promise = inspectTelemetryDataset(client, config);
  diagnosticCache = { key, loadedAt: Date.now(), promise };
  return promise;
}

export function useTelemetryDataset() {
  const [result, setResult] = useState({ requestKey: null, dataset: null });
  const [refreshToken, setRefreshToken] = useState(0);
  const config = getSupabaseConfig();
  const requestKey = `${config.url || 'missing-url'}:${config.configured}:${refreshToken}`;

  useEffect(() => {
    let current = true;
    const { client, config } = getSupabaseClient();
    getCachedDiagnostic(client, config, refreshToken > 0)
      .then(dataset => { if (current) setResult({ requestKey, dataset }); })
      .catch(error => {
        if (current) {
          const classified = classifySupabaseError(error);
          setResult({ requestKey, dataset: { status: classified.kind, reachable: false, tableAccessible: false, message: classified.message } });
        }
      })
      .catch(() => {});
    return () => { current = false; };
  }, [refreshToken, requestKey]);

  const retry = useCallback(() => setRefreshToken(value => value + 1), []);
  return { dataset: result.requestKey === requestKey ? result.dataset : null, isLoading: result.requestKey !== requestKey, retry };
}

export function useTelemetryChart(dataset, from, to, columns = TELEMETRY_COLUMNS) {
  const [chart, setChart] = useState({ status: 'idle', points: [], matchedRecordCount: 0, sampledRecordCount: 0, message: '' });
  const [refreshToken, setRefreshToken] = useState(0);
  const requestKey = `${dataset?.relation?.schema || 'default'}:${dataset?.relation?.table || ''}:${from || ''}:${to || ''}:${columns.join(',')}:${refreshToken}`;

  useEffect(() => {
    let current = true;
    if (!dataset?.tableAccessible || !dataset?.displayAllowed || !dataset.relation || !from || !to) return () => { current = false; };

    const { client } = getSupabaseClient();
    getTelemetryChartSample(client, { from, to, columns })
      .then(result => {
        if (!current) return;
        setChart({
          requestKey,
          status: result.rows.length ? 'ready' : 'empty',
          points: result.rows.map(normalizeTelemetryRow).filter(Boolean),
          matchedRecordCount: result.matchedRecordCount,
          sampledRecordCount: result.sampledRecordCount,
          message: result.rows.length ? '' : 'No records fall within this historical interval.',
        });
      })
      .catch(error => {
        if (!current) return;
        const classified = classifySupabaseError(error);
        setChart({ requestKey, status: classified.kind, points: [], matchedRecordCount: 0, sampledRecordCount: 0, message: classified.message });
      });
    return () => { current = false; };
  }, [dataset, from, to, columns, refreshToken, requestKey]);

  const retry = useCallback(() => setRefreshToken(value => value + 1), []);
  if (!dataset?.tableAccessible || !dataset?.displayAllowed || !from || !to) return { status: 'idle', points: [], matchedRecordCount: 0, sampledRecordCount: 0, message: '', retry };
  if (chart.requestKey !== requestKey) return { status: 'loading', points: [], matchedRecordCount: 0, sampledRecordCount: 0, message: '', retry };
  return { ...chart, retry };
}

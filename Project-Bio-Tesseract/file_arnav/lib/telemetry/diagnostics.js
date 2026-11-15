import { classifySupabaseError } from './errors';
import { getLatestTelemetry, getTelemetryStats } from './queries';
import { normalizeTelemetryRow } from './normalizers';
import { DATASET_SOURCE } from './schema';

export async function inspectTelemetryDataset(client, config, { signal } = {}) {
  if (!config.configured || !client) {
    return {
      status: 'not_configured',
      reachable: false,
      tableAccessible: false,
      message: `Add ${config.missing?.join(' and ') || 'the Supabase environment values'} to .env.local, then restart the app.`,
    };
  }
  try {
    if (signal?.aborted) throw new DOMException('The Supabase diagnostic was cancelled.', 'AbortError');
    const stats = await getTelemetryStats(client);
    const base = {
      reachable: true,
      tableAccessible: true,
      relation: DATASET_SOURCE.relation,
      stats,
      displayAllowed: false,
    };

    if (stats.visibleRecordCount === 0) {
      return {
        ...base,
        status: 'no_visible_rows',
        message: 'The table query succeeded, but this publishable-key role can see no rows. The table may be empty or RLS may be hiding its rows; this client cannot distinguish those cases.',
      };
    }

    if (!DATASET_SOURCE.provenanceVerifiedSynthetic || !DATASET_SOURCE.publicDisplayApproved) {
      return {
        ...base,
        status: 'provenance_review_required',
        message: 'Rows are visible to the publishable-key role, but this table includes biomedical and psychosocial fields. Historical measurement values are withheld until its provenance and public-read approval are confirmed.',
      };
    }

    const latestRow = await getLatestTelemetry(client);
    const latest = latestRow ? normalizeTelemetryRow(latestRow) : null;
    return {
      ...base,
      status: 'ready',
      displayAllowed: true,
      latest,
      nullRates: null,
      provenance: DATASET_SOURCE.provenance,
      personalHealthInformation: DATASET_SOURCE.personalHealthInformation,
      publicReadAuthorization: DATASET_SOURCE.publicReadAuthorization,
      databaseAccessMode: DATASET_SOURCE.databaseAccessMode,
      message: 'Owner-approved synthetic historical telemetry is accessible through the read-only Supabase Data API.',
    };
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    const classified = classifySupabaseError(error);
    return { status: classified.kind, reachable: classified.kind !== 'connection_unavailable', tableAccessible: false, displayAllowed: false, relation: DATASET_SOURCE.relation, message: classified.message };
  }
}

export function classifySupabaseError(error) {
  const code = String(error?.code || '');
  const status = Number(error?.status || error?.statusCode || 0);
  const message = String(error?.message || '');

  if (code === 'TELEMETRY_ORDERING_UNVERIFIED') {
    return { kind: 'ordering_unverified', message: 'Chart pagination is paused until a stable unique ordering key is verified or a safe database-side aggregation is deployed.' };
  }
  if (code === '42501' || status === 401 || status === 403 || /permission denied|row-level security|rls/i.test(message)) {
    return { kind: 'permission_denied', message: 'The Supabase request was denied. Check the table grant and read-only Row Level Security policy.' };
  }
  if (code === 'PGRST205' || code === '42P01' || status === 404 || /relation .* does not exist|table .* not found/i.test(message)) {
    return { kind: 'table_not_found', message: 'The configured table is not exposed by the Supabase Data API or does not exist in that schema.' };
  }
  if (code === 'PGRST204' || code === '42703' || /column .* does not exist/i.test(message)) {
    return { kind: 'schema_mismatch', message: 'The table exists, but its columns do not match the verified telemetry mapping.' };
  }
  if (error instanceof TypeError || /fetch failed|network|load failed/i.test(message)) {
    return { kind: 'connection_unavailable', message: 'Supabase could not be reached. Check the project URL, network, and Data API availability.' };
  }
  return { kind: 'query_failed', message: 'The Supabase request failed. Retry and check the project Data API logs if it continues.' };
}

export const SUPABASE_ENV_KEYS = Object.freeze({
  url: 'NEXT_PUBLIC_SUPABASE_URL',
  publishableKey: 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
});

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || '';
  const missing = [];

  if (!url) missing.push(SUPABASE_ENV_KEYS.url);
  if (!publishableKey) missing.push(SUPABASE_ENV_KEYS.publishableKey);

  if (missing.length) {
    return { configured: false, missing, url: null, publishableKey: null };
  }

  try {
    const parsed = new URL(url);
    if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('Unsupported protocol');
    return { configured: true, missing: [], url: parsed.origin, publishableKey };
  } catch {
    return { configured: false, missing: ['a valid Supabase project URL'], url: null, publishableKey: null };
  }
}

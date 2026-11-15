'use client';

import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './config';

let browserClient;

export function getSupabaseClient() {
  const config = getSupabaseConfig();
  if (!config.configured) return { client: null, config };

  if (!browserClient) {
    browserClient = createClient(config.url, config.publishableKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
  }

  return { client: browserClient, config };
}

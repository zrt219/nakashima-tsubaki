import { createBrowserClient } from '@supabase/ssr'
import { getSupabasePublicConfig } from "@/lib/supabase/factories";

export function createClient() {
  const config = getSupabasePublicConfig();
  if (!config) {
    throw new Error("Supabase public env vars are not configured: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return createBrowserClient(
    config.url,
    config.anonKey
  )
}

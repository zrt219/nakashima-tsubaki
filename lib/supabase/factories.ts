import { createClient, type SupabaseClient, type SupabaseClientOptions } from "@supabase/supabase-js";

type PublicConfig = {
  url: string;
  anonKey: string;
};

type ServiceRoleConfig = {
  url: string;
  serviceRoleKey: string;
};

function readOptionalEnv(name: string) {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    return null;
  }
  return value;
}

export function getSupabasePublicConfig(): PublicConfig | null {
  const url = readOptionalEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = readOptionalEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!url || !anonKey) {
    return null;
  }
  return { url, anonKey };
}

export function getSupabaseServiceRoleConfig(): ServiceRoleConfig | null {
  const url = readOptionalEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = readOptionalEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) {
    return null;
  }
  return { url, serviceRoleKey };
}

export function createSupabasePublicClient(options?: SupabaseClientOptions<"public">) {
  const config = getSupabasePublicConfig();
  if (!config) {
    return null;
  }

  try {
    return createClient(config.url, config.anonKey, options);
  } catch {
    return null;
  }
}

export function createSupabaseServiceRoleClient(options?: SupabaseClientOptions<"public">): SupabaseClient | null {
  const config = getSupabaseServiceRoleConfig();
  if (!config) {
    return null;
  }

  try {
    return createClient(config.url, config.serviceRoleKey, options);
  } catch {
    return null;
  }
}

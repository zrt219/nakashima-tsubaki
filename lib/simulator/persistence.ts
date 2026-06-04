export type SimulatorPersistenceMode = "browser" | "server" | "supabase";

export function getSimulatorPersistenceMode(): SimulatorPersistenceMode {
  if (process.env.NEXT_PUBLIC_SIMULATOR_PERSISTENCE_MODE === "browser") {
    return "browser";
  }

  if (process.env.NEXT_PUBLIC_SIMULATOR_PERSISTENCE_MODE === "supabase") {
    return "supabase";
  }

  return "server";
}

export function getSimulatorPersistenceLabel() {
  const mode = getSimulatorPersistenceMode();

  if (mode === "supabase") {
    return "Supabase adapter configured";
  }

  if (mode === "browser") {
    return "Local browser persistence";
  }

  return "Local server persistence";
}

export function getSupabaseReadiness() {
  return {
    urlConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    serviceRoleConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    projectRef: process.env.SIMULATOR_SUPABASE_PROJECT_REF ?? "gajpnqqfkjtmqdnufbcf"
  };
}

import type { ReflexRun } from "@/lib/reflex-agents/types";

const MAX_TRACES = 24;
const store = new Map<string, ReflexRun>();

export function upsertReflexRun(run: ReflexRun) {
  store.set(run.id, run);
  if (store.size > MAX_TRACES) {
    const keys = Array.from(store.keys());
    const keep = keys.slice(-MAX_TRACES);
    for (const key of keys) {
      if (!keep.includes(key)) store.delete(key);
    }
  }
}

export function getReflexRun(runId: string): ReflexRun | undefined {
  return store.get(runId);
}

export function listReflexRuns(limit = 10): ReflexRun[] {
  const values = Array.from(store.values()).sort((a, b) => {
    if (!a.completedAt) return -1;
    if (!b.completedAt) return 1;
    return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
  });
  return values.slice(0, limit);
}

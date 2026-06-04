import { createSimulationRun, getRunSummary, updateRunQuery } from "@/lib/simulator/engine";
import { defaultScenarioInput } from "@/lib/simulator/seed-data";
import type { RunSummary, ScenarioInput, SimulationRun } from "@/lib/simulator/types";

const STORAGE_KEY = "tn-quality-hold-simulator:v1";
const STORAGE_EVENT = "tn-quality-hold-simulator:change";

type SimulatorStore = {
  version: 1;
  recentRunIds: string[];
  runs: Record<string, SimulationRun>;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

const emptyStore: SimulatorStore = {
  version: 1,
  recentRunIds: [],
  runs: {}
};

function getEmptyStore(): SimulatorStore {
  return emptyStore;
}

let cachedRawValue: string | null = null;
let cachedStore: SimulatorStore | null = null;

function readStore(): SimulatorStore {
  if (!canUseStorage()) {
    return getEmptyStore();
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    cachedRawValue = null;
    cachedStore = null;
    return getEmptyStore();
  }

  if (rawValue === cachedRawValue && cachedStore) {
    return cachedStore;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as SimulatorStore;
    if (parsedValue.version !== 1 || !parsedValue.runs || !parsedValue.recentRunIds) {
      cachedRawValue = null;
      cachedStore = null;
      return getEmptyStore();
    }
    
    cachedRawValue = rawValue;
    cachedStore = parsedValue;
    return parsedValue;
  } catch {
    cachedRawValue = null;
    cachedStore = null;
    return getEmptyStore();
  }
}

function writeStore(store: SimulatorStore) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
}

function saveRun(run: SimulationRun) {
  const store = readStore();
  store.runs[run.id] = run;
  store.recentRunIds = [run.id, ...store.recentRunIds.filter((storedId) => storedId !== run.id)].slice(0, 12);
  writeStore(store);
  return run;
}

export function createLocalRun(input: ScenarioInput = defaultScenarioInput) {
  return saveRun(createSimulationRun(input));
}

let cachedSummaries: RunSummary[] | null = null;
let cachedSummariesStoreRef: SimulatorStore | null = null;

export function listLocalRunSummaries(): RunSummary[] {
  const store = readStore();

  if (cachedSummaries && cachedSummariesStoreRef === store) {
    return cachedSummaries;
  }

  const summaries = store.recentRunIds
    .map((runId) => store.runs[runId])
    .filter(Boolean)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .map((run) => getRunSummary(run));

  cachedSummariesStoreRef = store;
  cachedSummaries = summaries;

  return summaries;
}

export function loadLocalRun(runId: string) {
  return readStore().runs[runId] ?? null;
}

export function persistLocalRun(run: SimulationRun) {
  return saveRun(run);
}

export function updateLocalRunQuery(runId: string, query: string) {
  const existingRun = loadLocalRun(runId);
  if (!existingRun) {
    return null;
  }

  return saveRun(updateRunQuery(existingRun, query));
}

export function getLatestLocalRun() {
  return listLocalRunSummaries()[0] ?? null;
}

export function subscribeToLocalSimulatorStore(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleChange = () => callback();

  window.addEventListener(STORAGE_EVENT, handleChange);
  window.addEventListener("storage", handleChange);

  return () => {
    window.removeEventListener(STORAGE_EVENT, handleChange);
    window.removeEventListener("storage", handleChange);
  };
}

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createSimulationRun, getRunSummary } from "@/lib/simulator/engine";
import { defaultScenarioInput } from "@/lib/simulator/seed-data";
import type { RunSummary, ScenarioInput, SimulationRun } from "@/lib/simulator/types";

type ServerSimulatorStore = {
  version: 1;
  recentRunIds: string[];
  runs: Record<string, SimulationRun>;
};

function getEmptyStore(): ServerSimulatorStore {
  return {
    version: 1,
    recentRunIds: [],
    runs: {}
  };
}

function getStoreFilePath() {
  const configuredFileName = path.basename(
    process.env.SIMULATOR_FILE_STORE_PATH ?? "simulator-runs.json"
  );

  return path.join(process.cwd(), "data", configuredFileName);
}

async function ensureStoreDirectory() {
  await mkdir(path.dirname(getStoreFilePath()), { recursive: true });
}

async function readStore(): Promise<ServerSimulatorStore> {
  const filePath = getStoreFilePath();

  try {
    const rawValue = await readFile(filePath, "utf8");
    const parsedValue = JSON.parse(rawValue) as ServerSimulatorStore;

    if (parsedValue.version !== 1 || !parsedValue.runs || !parsedValue.recentRunIds) {
      return getEmptyStore();
    }

    return parsedValue;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("ENOENT")) {
      return getEmptyStore();
    }

    return getEmptyStore();
  }
}

async function writeStore(store: ServerSimulatorStore) {
  await ensureStoreDirectory();
  await writeFile(getStoreFilePath(), JSON.stringify(store, null, 2), "utf8");
}

async function saveRun(run: SimulationRun) {
  const store = await readStore();
  store.runs[run.id] = run;
  store.recentRunIds = [run.id, ...store.recentRunIds.filter((storedId) => storedId !== run.id)].slice(0, 24);
  await writeStore(store);
  return run;
}

export async function createServerRun(input: ScenarioInput = defaultScenarioInput) {
  return saveRun(createSimulationRun(input));
}

export async function listServerRunSummaries(): Promise<RunSummary[]> {
  const store = await readStore();

  return store.recentRunIds
    .map((runId) => store.runs[runId])
    .filter(Boolean)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .map((run) => getRunSummary(run));
}

export async function loadServerRun(runId: string) {
  const store = await readStore();
  return store.runs[runId] ?? null;
}

export async function persistServerRun(run: SimulationRun) {
  return saveRun(run);
}

export async function getLatestServerRun() {
  return (await listServerRunSummaries())[0] ?? null;
}

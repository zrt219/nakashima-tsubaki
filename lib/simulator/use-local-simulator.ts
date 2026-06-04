"use client";

import { useSyncExternalStore } from "react";
import {
  getLatestLocalRun,
  listLocalRunSummaries,
  loadLocalRun,
  subscribeToLocalSimulatorStore
} from "@/lib/simulator/local-store";

const emptyRuns: ReturnType<typeof listLocalRunSummaries> = [];

export function useLatestLocalRun() {
  return useSyncExternalStore(
    subscribeToLocalSimulatorStore,
    getLatestLocalRun,
    () => null
  );
}

export function useLocalRunSummaries() {
  return useSyncExternalStore(
    subscribeToLocalSimulatorStore,
    listLocalRunSummaries,
    () => emptyRuns
  );
}

export function useLocalRun(runId: string) {
  return useSyncExternalStore(
    subscribeToLocalSimulatorStore,
    () => loadLocalRun(runId),
    () => null
  );
}

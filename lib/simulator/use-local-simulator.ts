"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  getLatestLocalRun,
  listLocalRunSummaries,
  loadLocalRun,
  subscribeToLocalSimulatorStore
} from "@/lib/simulator/local-store";

const emptyRuns: ReturnType<typeof listLocalRunSummaries> = [];

const getServerSnapshotEmptyArray = () => emptyRuns;
const getServerSnapshotNull = () => null;

export function useLatestLocalRun() {
  return useSyncExternalStore(
    subscribeToLocalSimulatorStore,
    getLatestLocalRun,
    getServerSnapshotNull
  );
}

export function useLocalRunSummaries() {
  return useSyncExternalStore(
    subscribeToLocalSimulatorStore,
    listLocalRunSummaries,
    getServerSnapshotEmptyArray
  );
}

export function useLocalRun(runId: string) {
  const getSnapshot = useCallback(() => loadLocalRun(runId), [runId]);
  
  return useSyncExternalStore(
    subscribeToLocalSimulatorStore,
    getSnapshot,
    getServerSnapshotNull
  );
}

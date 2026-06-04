"use client";

import { useEffect, useState } from "react";
import { createLocalRun, persistLocalRun } from "@/lib/simulator/local-store";
import { getSimulatorPersistenceMode } from "@/lib/simulator/persistence";
import { useLatestLocalRun, useLocalRun, useLocalRunSummaries } from "@/lib/simulator/use-local-simulator";
import type { RunSummary, ScenarioInput, SimulationRun } from "@/lib/simulator/types";

const REMOTE_EVENT = "tn-simulator-remote-store:change";

type RemoteIndexState = {
  loaded: boolean;
  latestRun: RunSummary | null;
  recentRuns: RunSummary[];
};

type RemoteRunState = {
  loaded: boolean;
  run: SimulationRun | null;
};

function isBrowserMode() {
  return getSimulatorPersistenceMode() === "browser";
}

function notifyRemoteStoreChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(REMOTE_EVENT));
}

function subscribeRemoteStore(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener(REMOTE_EVENT, callback);

  return () => {
    window.removeEventListener(REMOTE_EVENT, callback);
  };
}

async function readJson<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(`Simulator request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

function useRemoteStoreSignal() {
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (isBrowserMode()) {
      return;
    }

    return subscribeRemoteStore(() => {
      setRevision((currentRevision) => currentRevision + 1);
    });
  }, []);

  return revision;
}

function useRemoteIndexState(): RemoteIndexState {
  const revision = useRemoteStoreSignal();
  const [state, setState] = useState<RemoteIndexState>({
    loaded: false,
    latestRun: null,
    recentRuns: []
  });

  useEffect(() => {
    if (isBrowserMode()) {
      return;
    }

    let active = true;

    async function load() {
      try {
        const payload = await readJson<{
          latestRun: RunSummary | null;
          summaries: RunSummary[];
        }>("/api/simulator/runs");

        if (!active) {
          return;
        }

        setState({
          loaded: true,
          latestRun: payload.latestRun ?? null,
          recentRuns: payload.summaries ?? []
        });
      } catch {
        if (!active) {
          return;
        }

        setState({
          loaded: true,
          latestRun: null,
          recentRuns: []
        });
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [revision]);

  return state;
}

function useRemoteRunState(runId: string): RemoteRunState {
  const revision = useRemoteStoreSignal();
  const [state, setState] = useState<RemoteRunState>({
    loaded: false,
    run: null
  });

  useEffect(() => {
    if (isBrowserMode()) {
      return;
    }

    let active = true;

    async function load() {
      try {
        const response = await fetch(`/api/simulator/runs/${runId}`, { cache: "no-store" });

        if (!active) {
          return;
        }

        if (response.status === 404) {
          setState({
            loaded: true,
            run: null
          });
          return;
        }

        if (!response.ok) {
          throw new Error(`Simulator run request failed: ${response.status}`);
        }

        const payload = (await response.json()) as { run: SimulationRun | null };
        setState({
          loaded: true,
          run: payload.run ?? null
        });
      } catch {
        if (!active) {
          return;
        }

        setState({
          loaded: true,
          run: null
        });
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [revision, runId]);

  return state;
}

export async function createSimulatorRun(input: ScenarioInput) {
  if (isBrowserMode()) {
    return createLocalRun(input);
  }

  const payload = await readJson<{ run: SimulationRun }>("/api/simulator/runs", {
    method: "POST",
    body: JSON.stringify({ input })
  });

  notifyRemoteStoreChange();
  return payload.run;
}

export async function persistSimulatorRun(run: SimulationRun) {
  if (isBrowserMode()) {
    return persistLocalRun(run);
  }

  const payload = await readJson<{ run: SimulationRun }>(`/api/simulator/runs/${run.id}`, {
    method: "PUT",
    body: JSON.stringify({ run })
  });

  notifyRemoteStoreChange();
  return payload.run;
}

export function useSimulatorLatestRun() {
  const latestLocalRun = useLatestLocalRun();
  const remoteState = useRemoteIndexState();

  return {
    isLoading: isBrowserMode() ? false : !remoteState.loaded,
    latestRun: isBrowserMode() ? latestLocalRun : remoteState.latestRun
  };
}

export function useSimulatorRunSummaries() {
  const localRuns = useLocalRunSummaries();
  const remoteState = useRemoteIndexState();

  return {
    isLoading: isBrowserMode() ? false : !remoteState.loaded,
    recentRuns: isBrowserMode() ? localRuns : remoteState.recentRuns
  };
}

export function useSimulatorRun(runId: string) {
  const localRun = useLocalRun(runId);
  const remoteState = useRemoteRunState(runId);

  return {
    isLoading: isBrowserMode() ? false : !remoteState.loaded,
    run: isBrowserMode() ? localRun : remoteState.run
  };
}

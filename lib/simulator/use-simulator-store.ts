"use client";

import { useState, useEffect, useCallback } from "react";
import type { SimulationRun, TwinScenario, WorkflowStepId, SimulatorEvent } from "./types";
import { SCENARIOS } from "./simulator-scenarios";

const STORAGE_KEY = "tn-simulator-runs:v2";
const EVENT_STREAM = "tn-simulator-event-stream";

type SimulatorState = {
  activeRun: SimulationRun | null;
  runs: SimulationRun[];
  timeScrubIndex: number | null;
};

let memoryStore: SimulatorState = {
  activeRun: null,
  runs: [],
  timeScrubIndex: null,
};

// Load from local storage
if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      memoryStore = JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Failed to load simulator storage", e);
  }
}

function persistStore() {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryStore));
    window.dispatchEvent(new CustomEvent(EVENT_STREAM));
  }
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function useSimulatorStore() {
  const [state, setState] = useState<SimulatorState>(memoryStore);

  useEffect(() => {
    const handleUpdate = () => setState({ ...memoryStore });
    window.addEventListener(EVENT_STREAM, handleUpdate);
    return () => window.removeEventListener(EVENT_STREAM, handleUpdate);
  }, []);

  const startScenario = useCallback((scenarioId: string) => {
    const scenario = SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;

    const newRun: SimulationRun = {
      id: generateId(),
      scenarioId: scenario.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentStep: "SCENARIO_SELECTED",
      events: [
        {
          id: generateId(),
          timestamp: new Date().toISOString(),
          scenarioId: scenario.id,
          state: "SCENARIO_SELECTED",
          actor: "operator",
          summary: `Selected scenario: ${scenario.name}`,
          evidenceHash: "0x" + generateId()
        }
      ],
      signals: JSON.parse(JSON.stringify(scenario.signals)), // Deep copy
      approvals: JSON.parse(JSON.stringify(scenario.requiredApprovals))
    };

    memoryStore.activeRun = newRun;
    memoryStore.runs.push(newRun);
    persistStore();
    
    return newRun.id;
  }, []);

  const advanceStep = useCallback((step: WorkflowStepId, actor: SimulatorEvent["actor"], summary: string) => {
    const run = memoryStore.activeRun;
    if (!run) return;

    run.currentStep = step;
    run.updatedAt = new Date().toISOString();
    run.events.push({
      id: generateId(),
      timestamp: new Date().toISOString(),
      scenarioId: run.scenarioId,
      state: step,
      actor,
      summary,
      evidenceHash: "0x" + generateId()
    });

    memoryStore.timeScrubIndex = null; // Snap back to realtime on new events
    persistStore();
  }, []);

  const setApproval = useCallback((gateId: string, status: "approved" | "rejected") => {
    const run = memoryStore.activeRun;
    if (!run) return;

    const gate = run.approvals.find((g) => g.id === gateId);
    if (gate) {
      gate.status = status;
      run.updatedAt = new Date().toISOString();
      persistStore();
    }
  }, []);

  const clearHistory = useCallback(() => {
    memoryStore.runs = [];
    memoryStore.activeRun = null;
    memoryStore.timeScrubIndex = null;
    persistStore();
  }, []);

  const setTimeScrubIndex = useCallback((index: number | null) => {
    memoryStore.timeScrubIndex = index;
    persistStore();
  }, []);

  // Compute derived run if scrubbing
  let derivedRun = state.activeRun;
  if (derivedRun && state.timeScrubIndex !== null && state.timeScrubIndex < derivedRun.events.length) {
    const scrubbedEvents = derivedRun.events.slice(0, state.timeScrubIndex + 1);
    const currentState = scrubbedEvents[scrubbedEvents.length - 1].state;
    derivedRun = {
      ...derivedRun,
      events: scrubbedEvents,
      currentStep: currentState
    };
  }

  return {
    activeRun: derivedRun,
    activeScenario: derivedRun ? SCENARIOS.find((s) => s.id === derivedRun!.scenarioId) : null,
    runs: state.runs,
    timeScrubIndex: state.timeScrubIndex,
    actualActiveRunLength: state.activeRun?.events.length || 0,
    startScenario,
    advanceStep,
    setApproval,
    clearHistory,
    setTimeScrubIndex
  };
}

export function useSimulatorLatestRun() {
  const { runs } = useSimulatorStore();
  const latestRun = runs.length > 0 ? runs[runs.length - 1] : null;
  return { latestRun };
}

export function useSimulatorRunSummaries() {
  const { runs } = useSimulatorStore();
  return { recentRuns: runs.slice().reverse() };
}

export function useSimulatorRun(runId: string) {
  const { runs } = useSimulatorStore();
  const run = runs.find(r => r.id === runId) || null;
  return { run, isLoading: false };
}

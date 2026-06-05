"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  SimulatorState,
  SimulatorEvent,
  SimulatorEventType,
  ReplayPacket,
  EvidenceSource,
} from "./types";
import { generateDeterministicHash } from "./engine";

interface SimulatorStore {
  activeScenarioId: string | null;
  runId: string;
  state: SimulatorState;
  events: SimulatorEvent[];
  evidence: EvidenceSource[];
  replays: ReplayPacket[];
  tutorialProgress: number;
  userMode: "tutorial" | "free" | "advanced";

  // Actions
  setScenario: (id: string) => void;
  transitionState: (newState: SimulatorState, reason?: string) => void;
  logEvent: (
    type: SimulatorEventType,
    actor: SimulatorEvent["actor"],
    summary: string,
    severity: SimulatorEvent["severity"],
    linkedEvidenceIds?: string[]
  ) => void;
  captureEvidence: (source: EvidenceSource) => void;
  saveReplay: (packet: ReplayPacket) => void;
  advanceTutorial: () => void;
  resetRun: () => void;
}

export const useSimulatorStore = create<SimulatorStore>()(
  persist(
    (set, get) => ({
      activeScenarioId: null,
      runId: crypto.randomUUID(),
      state: "IDLE",
      events: [],
      evidence: [],
      replays: [],
      tutorialProgress: 0,
      userMode: "tutorial",

      setScenario: (id: string) => {
        set({ activeScenarioId: id, state: "SCENARIO_SELECTED", runId: crypto.randomUUID(), events: [], evidence: [] });
      },

      transitionState: (newState: SimulatorState, reason?: string) => {
        set({ state: newState });
        // Optional: log automatic event on specific transitions if needed
      },

      logEvent: (type, actor, summary, severity, linkedEvidenceIds) => {
        const { runId, activeScenarioId, state, events } = get();
        const timestamp = new Date().toISOString();
        const hash = generateDeterministicHash([runId, type, timestamp, activeScenarioId || ""]);
        
        const newEvent: SimulatorEvent = {
          id: crypto.randomUUID(),
          timestamp,
          scenarioId: activeScenarioId || "unknown",
          runId,
          state,
          type,
          actor,
          severity,
          summary,
          details: "",
          evidenceHash: hash,
          linkedEvidenceIds,
        };

        set({ events: [...events, newEvent] });
      },

      captureEvidence: (source) => {
        set((state) => ({ evidence: [...state.evidence, source] }));
      },

      saveReplay: (packet) => {
        set((state) => ({ replays: [...state.replays, packet], state: "REPLAY_READY" }));
      },

      advanceTutorial: () => {
        set((state) => ({ tutorialProgress: state.tutorialProgress + 1 }));
      },

      resetRun: () => {
        set({
          activeScenarioId: null,
          runId: crypto.randomUUID(),
          state: "IDLE",
          events: [],
          evidence: [],
        });
      },
    }),
    {
      name: "tnpcc.simulator.v1",
      partialize: (state) => ({
        // only persist these keys
        activeScenarioId: state.activeScenarioId,
        state: state.state,
        tutorialProgress: state.tutorialProgress,
        userMode: state.userMode,
        replays: state.replays,
        events: state.events,
      }),
    }
  )
);

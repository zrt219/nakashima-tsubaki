export type TutorialStep = {
  id: string;
  title: string;
  description: string;
  targetElementId: string;
  requireAction?: boolean;
  placement?: "center" | "bottom" | "top" | "left" | "right";
};

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to TN Precision AI",
    description: "You are entering the cyber-physical bridge of the Nakashima-Tsubaki architecture. This environment allows operators to observe deterministic digital twin simulations of industrial incidents, fully isolated from physical hardware. Before you take control, this guided tour will walk you through the fundamental safety protocols and operational sequences of the AI command center.",
    targetElementId: "tutorial-welcome"
  },
  {
    id: "step-1",
    title: "Scenario Initialization",
    description: "A scenario represents a known failure vector—such as a thermal runaway event or a cyber-anomalous network intrusion. By selecting a scenario, you are instantiating a zero-risk WebGL twin bounded by real-world physical constraints and live telemetry simulation logic. Choose a scenario below to begin.",
    targetElementId: "tutorial-step-seed"
  },
  {
    id: "step-2",
    title: "Seed the Physical Incident",
    description: "Seeding an incident injects a controlled anomaly directly into the twin's telemetry streams. This triggers the deterministic state machine, pushing the spindle or network environment into a critical state. Click 'Seed Scenario' to launch the simulation. No actual factory floor equipment is affected.",
    targetElementId: "create-simulator-run",
    requireAction: true
  },
  {
    id: "step-3",
    title: "Real-Time Telemetry Drift",
    description: "The digital twin is now registering the injected anomaly. Observe the telemetry panel on the left: the metrics are drifting beyond their safe operational thresholds. The system is entering a 'Warning' state. Click 'Advance' to authorize the AI to detect and classify this signal anomaly.",
    targetElementId: "tutorial-step-advance",
    requireAction: true
  },
  {
    id: "step-4",
    title: "Context Retrieval (RAG)",
    description: "Once a critical signal is detected, the AI does not guess. It immediately queries the enterprise Knowledge Base using a Retrieval-Augmented Generation (RAG) pipeline. It cross-references the live anomaly signature against thousands of historical maintenance logs, sensor topologies, and OEM compliance manuals to find the exact ground-truth context.",
    targetElementId: "tutorial-step-advance",
    requireAction: true
  },
  {
    id: "step-5",
    title: "Advisory Recommendation",
    description: "Armed with RAG-verified context, the AI Engine formulates a precise, deterministic recommendation—such as a thermal offset update or a network quarantine protocol. This recommendation is guaranteed to be tethered to specific evidence files. The AI advises, but it is strictly barred from taking autonomous physical action.",
    targetElementId: "tutorial-step-advance",
    requireAction: true
  },
  {
    id: "step-6",
    title: "The Human-In-The-Loop Gate",
    description: "This is the absolute core of the Nakashima-Tsubaki safety architecture. Every single AI recommendation hits an impenetrable 'Operator Gate'. A qualified human must review the AI's logic, inspect the retrieved evidence, and explicitly grant cryptographically signed approval before any downstream action is permitted.",
    targetElementId: "tutorial-step-advance",
    requireAction: true
  },
  {
    id: "step-7",
    title: "Shadow Execution",
    description: "Once the human operator grants approval, the system does not immediately flash the hardware. It executes the command in 'Shadow Mode'. It simulates the corrective action on the digital twin first, mathematically verifying that the change resolves the anomaly without introducing cascading failures.",
    targetElementId: "tutorial-step-advance",
    requireAction: true
  },
  {
    id: "step-8",
    title: "Immutable Evidence Capture",
    description: "The crisis has been successfully averted in the simulation. The entire sequence—the initial anomaly, the RAG evidence, the AI's logic, your explicit operator approval, and the shadow execution result—is cryptographically hashed and sealed into the Evidence Ledger. This guarantees absolute post-incident traceability. You are now ready to operate the Command Center independently.",
    targetElementId: "tutorial-step-advance"
  }
];

type TutorialListener = (state: { isActive: boolean; currentStepIndex: number; activeStep: TutorialStep | null }) => void;

class TutorialStore {
  private isActive = false;
  private currentStepIndex = 0;
  private listeners: Set<TutorialListener> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tn-tutorial-state");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          this.isActive = parsed.isActive;
          this.currentStepIndex = parsed.currentStepIndex;
        } catch (e) {
          // ignore
        }
      }
    }
  }

  private notify() {
    const state = this.getState();
    if (typeof window !== "undefined") {
      localStorage.setItem("tn-tutorial-state", JSON.stringify({
        isActive: this.isActive,
        currentStepIndex: this.currentStepIndex
      }));
    }
    this.listeners.forEach((listener) => listener(state));
  }

  subscribe(listener: TutorialListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState() {
    return {
      isActive: this.isActive,
      currentStepIndex: this.currentStepIndex,
      activeStep: this.isActive ? TUTORIAL_STEPS[this.currentStepIndex] : null
    };
  }

  start() {
    this.isActive = true;
    this.currentStepIndex = 0;
    this.notify();
  }

  next() {
    if (this.currentStepIndex < TUTORIAL_STEPS.length - 1) {
      this.currentStepIndex++;
      this.notify();
    } else {
      this.finish();
    }
  }

  prev() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.notify();
    }
  }

  skip() {
    this.finish();
  }

  finish() {
    this.isActive = false;
    this.currentStepIndex = 0;
    this.notify();
  }
}

export const tutorialStore = new TutorialStore();

import { useState, useEffect } from "react";

export function useTutorialStore() {
  const [state, setState] = useState(tutorialStore.getState());

  useEffect(() => {
    return tutorialStore.subscribe(setState);
  }, []);

  return { ...state };
}

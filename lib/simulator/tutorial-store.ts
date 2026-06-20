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
    title: "INITIATING UPLINK",
    description: "Welcome to the TN Precision AI Command Center. I'll be your tactical sub-agent for this session. This platform is a masterclass in modern AI Engineering. Built on Next.js and Supabase, it demonstrates my creator's ability to orchestrate complex cyber-physical simulations entirely in the browser. Before I hand over control, let's calibrate your situational awareness.",
    targetElementId: "tutorial-welcome"
  },
  {
    id: "step-1",
    title: "MISSION: SCENARIO SELECTION",
    description: "Excellent. Below us are the anomaly seeds. A scenario represents a known failure vector—like thermal drift or vibration anomalies. By selecting one, you instantiate a zero-risk WebGL twin. Pick your poison.",
    targetElementId: "tutorial-step-seed"
  },
  {
    id: "step-2",
    title: "INJECTING ANOMALY",
    description: "We have our target vector. Clicking 'Seed Scenario' injects this anomaly directly into the twin's telemetry streams. Don't worry, the factory floor is perfectly safe. Shall we push the spindle to its limit?",
    targetElementId: "create-simulator-run",
    requireAction: true
  },
  {
    id: "step-3",
    title: "OBSERVE TELEMETRY DRIFT",
    description: "Look at the telemetry panel on the left. The metrics are cascading out of safe operational bounds. The system is flagging a critical warning state. Advance the simulation so I can begin my signal classification.",
    targetElementId: "tutorial-step-advance",
    requireAction: true
  },
  {
    id: "step-4",
    title: "RAG KNOWLEDGE RETRIEVAL",
    description: "I don't guess. I know. Using a high-performance Retrieval-Augmented Generation (RAG) pipeline built by my creator, I'm cross-referencing this live signature against an embedded enterprise Knowledge Base. This demonstrates advanced context-grounding without hallucination.",
    targetElementId: "tutorial-step-advance",
    requireAction: true
  },
  {
    id: "step-5",
    title: "COMPUTING ADVISORY",
    description: "Context verified. I've formulated a deterministic recommendation based on the RAG pipeline. This highlights a crucial safety pattern: I act strictly as an Advisory Agent. I am bound by the logic gates my creator wrote, ensuring I cannot take rogue autonomous physical action.",
    targetElementId: "tutorial-step-advance",
    requireAction: true
  },
  {
    id: "step-6",
    title: "THE OPERATOR GATE",
    description: "This is the absolute core of our safety architecture. My recommendation hits an impenetrable 'Operator Gate'. You, the human, must review my logic and explicitly grant cryptographically signed approval before anything moves.",
    targetElementId: "tutorial-step-advance",
    requireAction: true
  },
  {
    id: "step-7",
    title: "SHADOW EXECUTION",
    description: "Approval granted. But I don't flash the hardware just yet. I execute the command in 'Shadow Mode', simulating the corrective action on the digital twin first to mathematically guarantee it resolves the anomaly.",
    targetElementId: "tutorial-step-advance",
    requireAction: true
  },
  {
    id: "step-8",
    title: "IMMUTABLE LEDGER SEAL",
    description: "Crisis averted. But we aren't finished. My creator integrated Multi-Chain architecture into my core. The entire sequence is now cryptographically hashed and anchored into both the Hedera and XRPL Testnets via Supabase event hooks. Absolute traceability achieved. You have the conn, operator.",
    targetElementId: "tutorial-step-advance"
  }
];

type TutorialListener = (state: { isActive: boolean; currentStepIndex: number; activeStep: TutorialStep | null }) => void;

class TutorialStore {
  private isActive = false;
  private currentStepIndex = 0;
  private launchCount = 0;
  private listeners: Set<TutorialListener> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tn-tutorial-state-v2");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          this.isActive = parsed.isActive;
          this.currentStepIndex = parsed.currentStepIndex;
          this.launchCount = parsed.launchCount || 0;
        } catch (e) {
          // ignore
        }
      }
    }
  }

  private notify() {
    const state = this.getState();
    if (typeof window !== "undefined") {
      localStorage.setItem("tn-tutorial-state-v2", JSON.stringify({
        isActive: this.isActive,
        currentStepIndex: this.currentStepIndex,
        launchCount: this.launchCount
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
    const step = this.isActive ? { ...TUTORIAL_STEPS[this.currentStepIndex] } : null;
    
    // Memory contextual greeting!
    if (step && step.id === "welcome") {
      if (this.launchCount === 1) {
        step.description = "Ah, welcome back. I see you've run this before. Let's calibrate your situational awareness again.";
      } else if (this.launchCount > 1) {
        step.description = `Welcome back, Operator. This is your ${this.launchCount + 1}th tactical session. You know the drill: we are completely isolated from physical hardware.`;
      }
    }

    return {
      isActive: this.isActive,
      currentStepIndex: this.currentStepIndex,
      activeStep: step
    };
  }

  start() {
    this.isActive = true;
    this.currentStepIndex = 0;
    this.launchCount++;
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

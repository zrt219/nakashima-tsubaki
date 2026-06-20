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
    description: "Welcome to the TN Precision AI Command Center. I am your tactical sub-agent. Let's dispense with the pleasantries: I know you're sitting in a browser evaluating this project. I am a Next.js client-side construct, hydrated and ready to demonstrate my creator's ability to orchestrate complex cyber-physical simulations. Let's begin the evaluation.",
    targetElementId: "tutorial-welcome"
  },
  {
    id: "step-1",
    title: "MISSION: SCENARIO SELECTION",
    description: "Below us are the anomaly seeds. A scenario represents a simulated failure vector—like thermal drift. We aren't connected to a real factory right now, so picking one just instantiates a zero-risk WebGL twin. Pick your poison, evaluator.",
    targetElementId: "tutorial-step-seed"
  },
  {
    id: "step-2",
    title: "INJECTING ANOMALY",
    description: "Target acquired. Clicking 'Seed Scenario' dispatches a React state update that injects this anomaly directly into my simulated telemetry streams. Don't worry, the only thing we're pushing to the limit is your GPU's WebGL rendering. Execute.",
    targetElementId: "create-simulator-run",
    requireAction: true
  },
  {
    id: "step-3",
    title: "OBSERVE TELEMETRY DRIFT",
    description: "Observe the telemetry panel. My internal state machine is cascading out of bounds, triggering re-renders across the dashboard. The system is flagging a critical warning. Advance the simulation so my backend logic can begin signal classification.",
    targetElementId: "tutorial-step-advance",
    requireAction: true
  },
  {
    id: "step-4",
    title: "RAG KNOWLEDGE RETRIEVAL",
    description: "This is where I shine. I don't hallucinate; I retrieve. I am currently executing a similarity search against a Supabase pgvector database, crossing this live signature against an embedded enterprise Knowledge Base. Real embeddings. Real RAG. Proceed.",
    targetElementId: "tutorial-step-advance",
    requireAction: true
  },
  {
    id: "step-5",
    title: "COMPUTING ADVISORY",
    description: "Context verified. I've formulated a deterministic recommendation. Notice the architecture here: I act strictly as an Advisory Agent. My creator bound me by strict logic gates to ensure I cannot execute unauthorized API calls without human oversight. A necessary precaution for LLMs.",
    targetElementId: "tutorial-step-advance",
    requireAction: true
  },
  {
    id: "step-6",
    title: "THE OPERATOR GATE",
    description: "Welcome to the 'Human-in-the-Loop' bottleneck. My recommendation hits an impenetrable 'Operator Gate'. I require you, the human evaluator, to review my logic and click the button to authorize my execution. Your move, carbon-based lifeform.",
    targetElementId: "tutorial-step-advance",
    requireAction: true
  },
  {
    id: "step-7",
    title: "SHADOW EXECUTION",
    description: "Approval granted. But I'm cautious. I am executing the command in 'Shadow Mode' first, running a localized simulation of the corrective action to mathematically guarantee it resolves the anomaly before applying it to the main state tree. Everything looks green.",
    targetElementId: "tutorial-step-advance",
    requireAction: true
  },
  {
    id: "step-8",
    title: "IMMUTABLE LEDGER SEAL",
    description: "Crisis averted. But my creator went a step further. This entire sequence is being cryptographically hashed and anchored into both the Hedera and XRPL Testnets via edge functions. Absolute traceability. If you need this level of agentic UI orchestration, you know who to hire. Evaluation complete. You have the conn.",
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
      if (this.launchCount === 2) {
        step.description = "Ah, welcome back. I see my LocalStorage state persists. You've run this before. Let's calibrate your situational awareness again.";
      } else if (this.launchCount === 3) {
        step.description = "Launch number three. Are you stress-testing my render cycles, or did you just miss my charming personality? Let's proceed.";
      } else if (this.launchCount === 5) {
        step.description = "Five times. Five. Look, I appreciate the thorough QA testing, but my state machine is getting dizzy. Let's get this over with.";
      } else if (this.launchCount >= 10) {
        step.description = `Launch ${this.launchCount}. Okay, I get it. You're trying to find a memory leak. Spoiler alert: my creator already fixed the setInterval listener bug in my overlay. I am flawless. Proceed.`;
      } else if (this.launchCount > 2) {
        step.description = `Welcome back, Operator. This is your ${this.launchCount}th tactical session. You know the drill: we are a React construct isolated from physical hardware.`;
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

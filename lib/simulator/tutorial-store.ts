import { useState, useEffect } from "react";
import { Tone, Verbosity, COURSE_MODULES, TutorialStepConfig } from "./tutorial-content";

type TutorialState = {
  isActive: boolean;
  currentStepIndex: number;
  launchCount: number;
  tone: Tone;
  verbosity: Verbosity;
  quizScore: number;
  isConfiguring: boolean;
};

type TutorialListener = (state: TutorialState & { activeStep: TutorialStepConfig | null }) => void;

class TutorialStore {
  private state: TutorialState = {
    isActive: false,
    currentStepIndex: 0,
    launchCount: 0,
    tone: "snarky",
    verbosity: "expanded",
    quizScore: 0,
    isConfiguring: false,
  };
  private listeners: Set<TutorialListener> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tn-academy-state-v3");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          this.state = { ...this.state, ...parsed, isActive: false, isConfiguring: false, currentStepIndex: 0 };
        } catch (e) {
          // ignore
        }
      }
    }
  }

  private notify() {
    if (typeof window !== "undefined") {
      localStorage.setItem("tn-academy-state-v3", JSON.stringify({
        launchCount: this.state.launchCount,
        tone: this.state.tone,
        verbosity: this.state.verbosity,
        quizScore: this.state.quizScore
      }));
    }
    const stateWithStep = this.getState();
    this.listeners.forEach((listener) => listener(stateWithStep));
  }

  subscribe(listener: TutorialListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState() {
    const step = this.state.isActive ? { ...COURSE_MODULES[this.state.currentStepIndex] } : null;
    return { ...this.state, activeStep: step };
  }

  openConfig() {
    this.state.isConfiguring = true;
    this.notify();
  }

  closeConfig() {
    this.state.isConfiguring = false;
    this.notify();
  }

  setPreferences(tone: Tone, verbosity: Verbosity) {
    this.state.tone = tone;
    this.state.verbosity = verbosity;
    this.notify();
  }

  start() {
    this.state.isConfiguring = false;
    this.state.isActive = true;
    this.state.currentStepIndex = 0;
    this.state.quizScore = 0;
    this.state.launchCount++;
    this.notify();
  }

  recordQuizAnswer(isCorrect: boolean) {
    if (isCorrect) {
      this.state.quizScore += 1;
    }
  }

  next() {
    if (this.state.currentStepIndex < COURSE_MODULES.length - 1) {
      this.state.currentStepIndex++;
      this.notify();
    } else {
      this.finish();
    }
  }

  prev() {
    if (this.state.currentStepIndex > 0) {
      this.state.currentStepIndex--;
      this.notify();
    }
  }

  finish() {
    this.state.isActive = false;
    this.state.currentStepIndex = 0;
    this.notify();
  }
}

export const tutorialStore = new TutorialStore();

export function useTutorialStore() {
  const [state, setState] = useState(tutorialStore.getState());

  useEffect(() => {
    return tutorialStore.subscribe(setState);
  }, []);

  return state;
}

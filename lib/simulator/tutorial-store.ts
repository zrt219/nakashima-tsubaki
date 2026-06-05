"use client";

import { useEffect, useState } from "react";

export type TutorialStep = {
  id: string; // The DOM id of the target element
  title: string;
  description: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
  requireAction?: boolean; // If true, the user must click the target element to proceed
};

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "tutorial-welcome",
    title: "Welcome to the Simulator",
    description: "This is a deterministic digital twin simulator. Let's walk through running an incident test.",
    placement: "center"
  },
  {
    id: "template-spindle_degradation",
    title: "Select a Scenario",
    description: "First, pick a scenario template. The Spindle Degradation template tests the predictive maintenance loop.",
    placement: "bottom"
  },
  {
    id: "tutorial-step-seed",
    title: "Seed the Incident",
    description: "You can adjust the parameters to create a deterministic outcome. Try setting Vibration Band to Critical.",
    placement: "left"
  },
  {
    id: "create-simulator-run",
    title: "Launch Simulation",
    description: "Click this button to deploy the isolated testnet run and enter the workbench.",
    placement: "top",
    requireAction: true
  },
  {
    id: "tutorial-step-advance",
    title: "Execute Workflow",
    description: "Inside the workbench, you follow the operator-safe procedures to detect, retrieve knowledge, and approve recommendations.",
    placement: "top",
    requireAction: true
  }
];

type TutorialState = {
  isActive: boolean;
  currentStepIndex: number;
};

let currentState: TutorialState = {
  isActive: false,
  currentStepIndex: 0
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export const tutorialStore = {
  start: () => {
    currentState = { isActive: true, currentStepIndex: 0 };
    emitChange();
  },
  stop: () => {
    currentState = { ...currentState, isActive: false };
    emitChange();
  },
  next: () => {
    if (currentState.currentStepIndex < TUTORIAL_STEPS.length - 1) {
      currentState = { ...currentState, currentStepIndex: currentState.currentStepIndex + 1 };
    } else {
      currentState = { ...currentState, isActive: false };
    }
    emitChange();
  },
  prev: () => {
    if (currentState.currentStepIndex > 0) {
      currentState = { ...currentState, currentStepIndex: currentState.currentStepIndex - 1 };
      emitChange();
    }
  },
  getState: () => currentState
};

export function useTutorialStore() {
  const [state, setState] = useState(currentState);

  useEffect(() => {
    const listener = () => setState(tutorialStore.getState());
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return state;
}

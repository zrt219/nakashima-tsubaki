"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type LearningContextType = {
  isLearningMode: boolean;
  toggleLearningMode: () => void;
  activeTopic: string | null;
  setActiveTopic: (topic: string | null) => void;
};

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export function LearningProvider({ children }: { children: ReactNode }) {
  const [isLearningMode, setIsLearningMode] = useState(false);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  const toggleLearningMode = () => setIsLearningMode((prev) => !prev);

  return (
    <LearningContext.Provider value={{ isLearningMode, toggleLearningMode, activeTopic, setActiveTopic }}>
      {children}
    </LearningContext.Provider>
  );
}

export function useLearning() {
  const context = useContext(LearningContext);
  if (context === undefined) {
    throw new Error("useLearning must be used within a LearningProvider");
  }
  return context;
}

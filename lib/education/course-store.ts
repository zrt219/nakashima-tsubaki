import { create } from "zustand";

export type ToneLevel = "brief" | "medium" | "expanded";

export type CourseModuleId = 
  | "overview" | "roadmap" | "rag" | "twins" | "ledger" 
  | "advisory" | "governance" | "architecture" | "kpis" | "qa" | "cognitive";

export interface CourseBadge {
  moduleId: CourseModuleId;
  earnedAt: string;
  score: number;
}

interface CourseState {
  tone: ToneLevel;
  setTone: (tone: ToneLevel) => void;
  
  // Badge and completion tracking
  badges: Record<string, CourseBadge>;
  awardBadge: (moduleId: CourseModuleId, score: number) => void;
  
  // RPG Mechanics
  xp: number;
  level: number;
  addXp: (amount: number) => void;
  
  // Cognitive Memory
  memories: string[];
  addMemory: (memory: string) => void;
  
  // Active module state
  activeModuleId: CourseModuleId | null;
  setActiveModule: (id: CourseModuleId | null) => void;
  
  // Quiz Modal State
  isQuizActive: boolean;
  openQuiz: () => void;
  closeQuiz: () => void;
}

export const useCourseStore = create<CourseState>((set) => ({
  tone: "medium",
  setTone: (tone) => set({ tone }),
  
  badges: {},
  awardBadge: (moduleId, score) => set((state) => ({
    badges: {
      ...state.badges,
      [moduleId]: { moduleId, earnedAt: new Date().toISOString(), score }
    }
  })),
  
  xp: 0,
  level: 1,
  addXp: (amount) => set((state) => {
    const newXp = state.xp + amount;
    const newLevel = Math.floor(newXp / 100) + 1; // 100 XP per level
    return { xp: newXp, level: newLevel };
  }),
  
  memories: [],
  addMemory: (memory) => set((state) => ({
    memories: [...state.memories, memory]
  })),

  activeModuleId: null,
  setActiveModule: (id) => set({ activeModuleId: id }),
  
  isQuizActive: false,
  openQuiz: () => set({ isQuizActive: true }),
  closeQuiz: () => set({ isQuizActive: false }),
}));

import { CourseModuleId } from "./course-store";

export interface CourseStep {
  id: string;
  title: string;
  // Dialogue variants based on user tone preference
  dialogue: {
    brief: string;
    medium: string;
    expanded: string;
  };
  // Citations or real-world documentation links
  citations?: { title: string; url: string; source: string }[];
}

export interface CourseData {
  moduleId: CourseModuleId;
  title: string;
  description: string;
  steps: CourseStep[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

// Temporary placeholder for all 11 courses. We will populate 'architecture' first.
export const COURSE_CATALOG: Record<CourseModuleId, CourseData> = {
  architecture: {
    moduleId: "architecture",
    title: "System Architecture & The Purdue Model",
    description: "Learn how modern industrial AI maps to legacy ISA-95/Purdue models without vendor lock-in.",
    steps: [
      {
        id: "arch_intro",
        title: "The Industrial Stack",
        dialogue: {
          brief: "This is your architecture stack. It maps modern AI to legacy PLCs.",
          medium: "Welcome to the System Architecture module. In industrial settings, we use the Purdue Model to separate IT (Enterprise) from OT (Operations). Drag the layers on the left to see how they fit.",
          expanded: "Ah, the System Architecture. A beautiful disaster of legacy PLCs and modern cloud infrastructure. The Purdue Enterprise Reference Architecture (PERA) was invented in the 90s, but we still use it to isolate the factory floor (Level 0-2) from the corporate network (Level 4-5). Click on the Edge Layer to begin mapping our modern Nakashima-Tsubaki twin onto this ancient structure."
        },
        citations: [
          { title: "ISA-95 Enterprise-Control System Integration", url: "https://www.isa.org/standards-and-publications/isa-standards/isa-standards-committees/isa95", source: "ISA" },
          { title: "Purdue Enterprise Reference Architecture", url: "https://en.wikipedia.org/wiki/Purdue_Enterprise_Reference_Architecture", source: "Wikipedia" }
        ]
      },
      {
        id: "arch_twin",
        title: "The Digital Twin Layer",
        dialogue: {
          brief: "The Digital Twin engine sits at Level 3, orchestrating data.",
          medium: "Our Digital Twin engine operates at Level 3 (Operations Management). It ingests high-frequency telemetry from the edge and creates a cyber-physical replica for the Swarm to analyze.",
          expanded: "Level 3 is where the magic happens. Traditionally, this is where your MES (Manufacturing Execution System) sits. But we've injected a real-time Digital Twin Engine here. It pulls OPC-UA streams from the Level 1 PLCs, normalizes them, and feeds them into the cognitive swarm. It's like replacing a rusty gears with a warp drive."
        }
      }
    ],
    quiz: [
      {
        question: "In the Purdue Model, where does the Digital Twin engine primarily ingest its real-time telemetry from?",
        options: [
          "Level 4 (Enterprise Cloud)",
          "Level 1 & 2 (PLCs, SCADA, Edge Devices)",
          "Level 5 (External Internet)",
          "Level 0 (Physical Chemical Reactions only)"
        ],
        correctIndex: 1,
        explanation: "The Digital Twin ingests data directly from the control and edge layers (Level 1/2) to build a real-time cyber-physical model."
      }
    ]
  },
  overview: {} as any,
  roadmap: {} as any,
  rag: {} as any,
  twins: {} as any,
  ledger: {} as any,
  advisory: {} as any,
  governance: {} as any,
  kpis: {} as any,
  qa: {} as any,
  cognitive: {} as any
};

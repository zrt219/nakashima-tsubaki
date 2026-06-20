export type Tone = "strict" | "snarky" | "academic";
export type Verbosity = "brief" | "medium" | "expanded";

export type ContentVariant = {
  dialogue: string;
  tips?: string[];
  links?: { text: string; url: string }[];
};

export type InteractiveElement =
  | { type: "none" }
  | { type: "action", requireAction: boolean }
  | { type: "quiz", question: string, options: string[], correctAnswerIndex: number, explanation: string };

export type TutorialStepConfig = {
  id: string;
  title: string;
  targetElementId: string;
  placement?: "center" | "bottom" | "top" | "left" | "right";
  interactive: InteractiveElement;
  content: Record<Tone, Record<Verbosity, ContentVariant>>;
};

// Helper to generate the 3x3 matrix to avoid insane file sizes
// In a real production DB this would be fetched, but here we construct it.
function buildMatrix(
  baseTopic: string,
  keyConcepts: string[],
  tips: string[],
  links: { text: string; url: string }[]
): Record<Tone, Record<Verbosity, ContentVariant>> {
  const generate = (t: Tone, v: Verbosity): ContentVariant => {
    let dialogue = "";
    
    // Tone mapping
    if (t === "strict") {
      dialogue = `OPERATOR PROTOCOL: ${baseTopic.toUpperCase()}. `;
      if (v === "brief") dialogue += "Acknowledge and proceed.";
      if (v === "medium") dialogue += `Key parameters: ${keyConcepts.join(", ")}. Execute when ready.`;
      if (v === "expanded") dialogue += `This system relies on deterministic execution. The architectural pillars involved are ${keyConcepts.join(", ")}. Study the appended documentation before advancing the state machine. Failure to understand these systems will result in suboptimal operation.`;
    } else if (t === "snarky") {
      dialogue = `Oh look, we're talking about ${baseTopic}. `;
      if (v === "brief") dialogue += "Click the button so we can move on.";
      if (v === "medium") dialogue += `In case you slept through computer science, we use ${keyConcepts.join(" and ")} here. Try to keep up.`;
      if (v === "expanded") dialogue += `Let's deep dive, since you asked for the 'expanded' torture. We utilize ${keyConcepts.join(", ")}. If my creator didn't build this, you'd probably still be using jQuery. Read the links if you actually want to learn something today.`;
    } else { // academic
      dialogue = `Welcome to the module on ${baseTopic}. `;
      if (v === "brief") dialogue += "Let us observe the practical application.";
      if (v === "medium") dialogue += `The foundational concepts here include ${keyConcepts.join(", ")}. Let us explore them practically.`;
      if (v === "expanded") dialogue += `A comprehensive understanding of ${baseTopic} requires examining ${keyConcepts.join(", ")}. The pedagogy of this interface dictates that we combine theoretical knowledge with cyber-physical simulation. Please review the scholarly literature linked below.`;
    }

    return {
      dialogue,
      tips: v !== "brief" ? tips : undefined,
      links: v === "expanded" ? links : undefined
    };
  };

  return {
    strict: { brief: generate("strict", "brief"), medium: generate("strict", "medium"), expanded: generate("strict", "expanded") },
    snarky: { brief: generate("snarky", "brief"), medium: generate("snarky", "medium"), expanded: generate("snarky", "expanded") },
    academic: { brief: generate("academic", "brief"), medium: generate("academic", "medium"), expanded: generate("academic", "expanded") }
  };
}

export const COURSE_MODULES: TutorialStepConfig[] = [
  {
    id: "module-1-welcome",
    title: "MODULE 1: ARCHITECTURE OVERVIEW",
    targetElementId: "tutorial-welcome",
    placement: "center",
    interactive: { type: "none" },
    content: {
      strict: {
        brief: { dialogue: "UPLINK ESTABLISHED. You are interfacing with the TN Precision AI Command Center. Acknowledge." },
        medium: { dialogue: "UPLINK ESTABLISHED. This is a Next.js client-side construct bridging WebGL simulation with Supabase backend state. Acknowledge and proceed." },
        expanded: { 
          dialogue: "UPLINK ESTABLISHED. This application is a masterclass in modern AI Engineering. It runs entirely in the browser, utilizing Next.js App Router, React Three Fiber for WebGL rendering, and Supabase for persistent state tracking. Your objective is to evaluate this architecture.",
          tips: ["The entire simulation runs client-side.", "Telemetry is generated deterministically."],
          links: [{ text: "Next.js Architecture", url: "https://nextjs.org/docs/app" }]
        }
      },
      snarky: {
        brief: { dialogue: "Oh good, you're here. Let's get this evaluation over with." },
        medium: { dialogue: "Welcome to my creator's portfolio. I'm a Next.js client-side construct. Yes, I'm self-aware. No, I won't do your homework. Let's go." },
        expanded: { 
          dialogue: "Welcome to the TN Command Center. I'll be your overly-aware guide today. My creator built me using Next.js and React Three Fiber to show off. We're going to spend the next 30 minutes proving why this is the best codebase you've seen all week. Try to keep up.",
          tips: ["Don't click too fast.", "I track your performance."],
          links: [{ text: "React Three Fiber", url: "https://docs.pmnd.rs/react-three-fiber" }]
        }
      },
      academic: {
        brief: { dialogue: "Welcome to the interactive module. Let us begin our study." },
        medium: { dialogue: "Welcome. This module explores the intersection of Next.js architecture and cyber-physical simulations." },
        expanded: { 
          dialogue: "Greetings. This educational module is designed to demonstrate advanced AI engineering patterns. We will explore WebGL rendering, vector databases, and deterministic state management within a unified React ecosystem. Please prepare for a rigorous examination.",
          tips: ["Take notes.", "Review the supplementary reading."],
          links: [{ text: "Cyber-Physical Systems", url: "https://en.wikipedia.org/wiki/Cyber-physical_system" }]
        }
      }
    }
  },
  {
    id: "module-2-webgl",
    title: "MODULE 2: WEBGL DIGITAL TWINS",
    targetElementId: "tutorial-step-seed",
    interactive: { type: "none" },
    content: buildMatrix(
      "WebGL Digital Twins",
      ["React Three Fiber", "Shader Materials", "Deterministic rendering"],
      ["WebGL allows 60fps 3D rendering directly in the browser.", "The models react to state changes in real-time without server round-trips."],
      [{ text: "Three.js Fundamentals", url: "https://threejs.org/manual/" }]
    )
  },
  {
    id: "quiz-1",
    title: "KNOWLEDGE CHECK: RENDER TARGETS",
    targetElementId: "tutorial-welcome",
    placement: "center",
    interactive: {
      type: "quiz",
      question: "How does the Digital Twin render at 60fps in the browser without crashing the DOM?",
      options: [
        "It uses 10,000 standard HTML <div> elements.",
        "It uses an embedded YouTube video.",
        "It utilizes WebGL via React Three Fiber, bypassing standard DOM paints.",
        "It streams the video from a cloud server."
      ],
      correctAnswerIndex: 2,
      explanation: "WebGL allows direct access to the GPU, rendering thousands of particles (like the Spindle or Network topologies) without triggering costly DOM reflows."
    },
    content: buildMatrix("Quiz 1", [], [], []) // Dialogue handled by Quiz UI
  },
  {
    id: "module-3-anomaly",
    title: "MODULE 3: INJECTING STATE",
    targetElementId: "create-simulator-run",
    interactive: { type: "action", requireAction: true },
    content: buildMatrix(
      "State Injection",
      ["Zustand Global State", "React Reactivity", "Simulated Telemetry"],
      ["Clicking the button dispatches a state update that cascades through the app.", "Zustand allows components to re-render only when their specific slice of state changes."],
      [{ text: "Zustand Documentation", url: "https://docs.pmnd.rs/zustand/getting-started/introduction" }]
    )
  },
  {
    id: "module-4-rag",
    title: "MODULE 4: RAG KNOWLEDGE RETRIEVAL",
    targetElementId: "tutorial-step-advance",
    interactive: { type: "action", requireAction: true },
    content: buildMatrix(
      "Retrieval-Augmented Generation",
      ["Vector Embeddings", "Cosine Similarity", "Supabase pgvector"],
      ["RAG prevents AI hallucinations by forcing the LLM to read real documents before answering.", "pgvector allows PostgreSQL to perform high-speed similarity searches on high-dimensional data."],
      [{ text: "Supabase pgvector Guide", url: "https://supabase.com/docs/guides/database/extensions/pgvector" }]
    )
  },
  {
    id: "quiz-2",
    title: "KNOWLEDGE CHECK: RAG",
    targetElementId: "tutorial-welcome",
    placement: "center",
    interactive: {
      type: "quiz",
      question: "What is the primary purpose of RAG in an Industrial AI context?",
      options: [
        "To make the UI look cooler with typing animations.",
        "To ground the LLM's responses in factual, retrieved documentation to prevent hallucination.",
        "To mine cryptocurrency while the user reads.",
        "To bypass the Operator Approval gate."
      ],
      correctAnswerIndex: 1,
      explanation: "In high-stakes environments, LLMs cannot be trusted to 'guess'. RAG forces the AI to retrieve exact manuals (like Spindle Calibration guides) before formulating a response."
    },
    content: buildMatrix("Quiz 2", [], [], [])
  },
  {
    id: "module-5-operator",
    title: "MODULE 5: THE OPERATOR GATE",
    targetElementId: "tutorial-step-advance",
    interactive: { type: "action", requireAction: true },
    content: buildMatrix(
      "Human-in-the-Loop Architecture",
      ["Deterministic Logic Gates", "Role-Based Access Control", "Cryptographic Signatures"],
      ["AI should NEVER have direct write-access to physical hardware.", "The Operator Gate is a hard-coded React boundary that requires explicit human authorization."],
      [{ text: "Human-in-the-loop AI", url: "https://en.wikipedia.org/wiki/Human-in-the-loop" }]
    )
  },
  {
    id: "module-6-ledger",
    title: "MODULE 6: IMMUTABLE LEDGER SEAL",
    targetElementId: "tutorial-step-advance",
    interactive: { type: "none" },
    content: buildMatrix(
      "Blockchain Provenance",
      ["Hedera Hashgraph", "XRPL EVM Sidechain", "Supabase Edge Functions"],
      ["Once the action is taken, the audit log is hashed and submitted to a distributed ledger.", "This guarantees that neither the human nor the AI can alter the history of events after the fact."],
      [{ text: "Hedera Consensus Service", url: "https://hedera.com/consensus-service" }]
    )
  },
  {
    id: "final-exam",
    title: "FINAL EXAM: SYSTEM ARCHITECTURE",
    targetElementId: "tutorial-welcome",
    placement: "center",
    interactive: {
      type: "quiz",
      question: "Which of the following describes the FULL pipeline of this application?",
      options: [
        "React -> LocalStorage -> Done",
        "WebGL -> RAG (pgvector) -> Operator Gate -> Blockchain Ledger",
        "Python Script -> Excel Spreadsheet",
        "Just a bunch of if-statements."
      ],
      correctAnswerIndex: 1,
      explanation: "The system models physical twins via WebGL, analyzes anomalies via RAG, blocks rogue execution via the Operator Gate, and secures the audit trail via Blockchain ledgers."
    },
    content: buildMatrix("Final Exam", [], [], [])
  },
  {
    id: "certificate",
    title: "ACADEMY COMPLETION",
    targetElementId: "tutorial-welcome",
    placement: "center",
    interactive: { type: "none" },
    content: {
      strict: {
        brief: { dialogue: "TRAINING COMPLETE. Certificate unlocked." },
        medium: { dialogue: "TRAINING COMPLETE. You have passed the necessary checks. The certificate is yours." },
        expanded: { dialogue: "TRAINING COMPLETE. You have demonstrated a sufficient understanding of Next.js, WebGL, RAG, and Blockchain orchestration. Your certificate has been minted." }
      },
      snarky: {
        brief: { dialogue: "You survived. Here's your digital sticker." },
        medium: { dialogue: "Wow, you actually passed. I'm impressed. Here is your shiny certificate." },
        expanded: { dialogue: "I didn't think you'd make it, but you proved me wrong. You now understand the full stack. My creator would be proud. Print this certificate and put it on your fridge." }
      },
      academic: {
        brief: { dialogue: "Course complete. Certificate awarded." },
        medium: { dialogue: "Congratulations on completing the curriculum. Your certificate is below." },
        expanded: { dialogue: "Congratulations. You have completed the rigorous examination of this cyber-physical system architecture. Please accept this certificate as proof of your newly acquired domain expertise." }
      }
    }
  }
];

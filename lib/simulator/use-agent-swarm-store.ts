import { create } from "zustand";
import { startScenario, advanceStep } from "./use-simulator-store";
import type { WorkflowStepId } from "./types";

export type AgentType = "inspector" | "fixer" | "guardian" | "analyst";

export interface SwarmAgent {
  id: string;
  type: AgentType;
  status: "idle" | "working" | "error";
  targetX: number;
  targetY: number;
  assignedTargetId?: string; // DOM element ID to track
  message: string;
  helpTip?: string;
  createdAt: number;
}

export interface AgentSwarmState {
  terminalOpen: boolean;
  history: string[];
  agents: SwarmAgent[];

  toggleTerminal: () => void;
  openTerminal: () => void;
  closeTerminal: () => void;
  
  executeCommand: (cmd: string) => void;
  
  spawnAgent: (type: AgentType, count?: number, targetId?: string) => void;
  killAllAgents: () => void;
  setAgentTargets: (x: number, y: number) => void;
  assignAgentToDom: (agentId: string, domId: string) => void;
}

function generateHexDump(lines: number) {
  let dump = "";
  for (let i = 0; i < lines; i++) {
    const addr = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, "0");
    const hex = Array.from({ length: 8 }).map(() => Math.floor(Math.random() * 255).toString(16).padStart(2, "0")).join(" ");
    const ascii = Array.from({ length: 8 }).map(() => String.fromCharCode(33 + Math.floor(Math.random() * 94))).join("");
    dump += `0x${addr}  ${hex}  |${ascii}|\n`;
  }
  return dump;
}

export const useAgentSwarmStore = create<AgentSwarmState>((set, get) => ({
  terminalOpen: false,
  history: [
    "> TN PRECISION AI KERNEL v9.0.4",
    "> AGENT SWARM COMMAND CENTER INITIALIZED",
    "> Type 'help' for a list of available commands."
  ],
  agents: [],

  toggleTerminal: () => set((state) => ({ terminalOpen: !state.terminalOpen })),
  openTerminal: () => set({ terminalOpen: true }),
  closeTerminal: () => set({ terminalOpen: false }),

  executeCommand: (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    set((state) => ({
      history: [...state.history, `> ${trimmed}`]
    }));

    const args = trimmed.split(" ").filter(Boolean);
    const primary = args[0].toLowerCase();

    let output = "";

    switch (primary) {
      case "help":
        output = `Available commands:
  spawn twin [--type=inspector|fixer|guardian|analyst] [--qty=N] [--target=dom_id]
  agent assign --id=[agent_id] --target=[dom_id]
  killall
  clear
  sim trigger [scenario_id]
  sim advance [step_id]
  analyze [target]`;
        break;
      case "clear":
        set({ history: [] });
        return;
      case "killall":
        set({ agents: [] });
        output = "[SYSTEM] All twin agents terminated.\n" + generateHexDump(2);
        break;
      case "spawn":
        if (args[1] === "twin" || args[1] === "agent") {
          let type: AgentType = "inspector";
          let qty = 1;
          let targetId: string | undefined;

          for (const arg of args) {
            if (arg.startsWith("--type=")) {
              const t = arg.split("=")[1];
              if (["inspector", "fixer", "guardian", "analyst"].includes(t)) {
                type = t as AgentType;
              }
            }
            if (arg.startsWith("--qty=")) {
              const q = parseInt(arg.split("=")[1], 10);
              if (!isNaN(q) && q > 0 && q < 100) qty = q;
            }
            if (arg.startsWith("--target=")) {
              targetId = arg.split("=")[1];
            }
          }

          get().spawnAgent(type, qty, targetId);
          output = `[||||||||||] 100% - Spawned ${qty} ${type} twin(s).\n${generateHexDump(1)}`;
        } else {
          output = "Unknown spawn target. Try 'spawn twin'.";
        }
        break;
      case "agent":
        if (args[1] === "assign") {
          let aId = "";
          let tId = "";
          for (const arg of args) {
            if (arg.startsWith("--id=")) aId = arg.split("=")[1];
            if (arg.startsWith("--target=")) tId = arg.split("=")[1];
          }
          if (aId && tId) {
            get().assignAgentToDom(aId, tId);
            output = `Agent [${aId}] locking onto target [${tId}]...`;
          } else {
             output = "Usage: agent assign --id=[id] --target=[dom_id]";
          }
        }
        break;
      case "sim":
        const simAction = args[1];
        const simTarget = args[2];

        if (simAction === "trigger" && simTarget) {
          startScenario(simTarget);
          output = `[SIM_KERNEL] Triggered scenario: ${simTarget}\n` + generateHexDump(2);
        } else if (simAction === "advance" && simTarget) {
          advanceStep(simTarget as WorkflowStepId, "simulator", "Forced advance via Swarm Terminal");
          output = `[SIM_KERNEL] Advanced simulator step to: ${simTarget}\n` + generateHexDump(2);
        } else {
          output = `[SIM_KERNEL] Invalid sim command. Usage:\n  sim trigger [scenario_id]\n  sim advance [step_id]\n` + generateHexDump(1);
        }
        break;
      case "analyze":
        output = `[ANALYSIS_MODULE] Scanning ${args[1] || "current state"}...
[||||||    ] 60%
[||||||||||] 100%
Results encrypted.`;
        get().spawnAgent("analyst", 1);
        break;
      default:
        output = `Command not recognized: ${primary}\n` + generateHexDump(1);
    }

    if (output) {
      set((state) => ({
        history: [...state.history, ...output.split("\n")]
      }));
    }
  },

  spawnAgent: (type: AgentType, count = 1, targetId?: string) => {
    const newAgents: SwarmAgent[] = [];
    
    // Generate context-aware tip
    let tip = "";
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path.includes("qa")) tip = "Tip: Hover over the Characteristics panel to see the 3D breakout view.";
      else if (path.includes("cognitive")) tip = "Tip: The core KERNEL node drives the anomaly detection engine.";
      else if (path.includes("simulator")) tip = "Tip: Try forcing a scenario using 'sim trigger thermal_variance'.";
      else if (path.includes("governance")) tip = "Tip: The Trust Score Engine updates live via Merkle verification.";
      else tip = "Tip: Open the terminal with CTRL+K to command the swarm.";
    }

    for (let i = 0; i < count; i++) {
      newAgents.push({
        id: Math.random().toString(36).substring(7),
        type,
        status: targetId ? "working" : "idle",
        targetX: typeof window !== "undefined" ? window.innerWidth / 2 : 500,
        targetY: typeof window !== "undefined" ? window.innerHeight / 2 : 500,
        assignedTargetId: targetId,
        message: targetId ? `Locking ${targetId}` : "Awaiting orders",
        helpTip: i === 0 ? tip : undefined, // Only give tip to first agent of batch
        createdAt: Date.now()
      });
    }
    set((state) => ({ agents: [...state.agents, ...newAgents] }));
  },

  killAllAgents: () => set({ agents: [] }),

  setAgentTargets: (x: number, y: number) => {
    set((state) => ({
      agents: state.agents.map((a) => {
        if (a.assignedTargetId) return a; // Don't override locked agents
        return {
          ...a,
          targetX: x,
          targetY: y,
          status: "working",
          message: "Investigating..."
        };
      })
    }));
  },

  assignAgentToDom: (agentId: string, domId: string) => {
    set((state) => ({
      agents: state.agents.map((a) => {
        if (a.id === agentId || agentId === "all") {
          return {
            ...a,
            assignedTargetId: domId,
            status: "working",
            message: `Locking ${domId}`
          };
        }
        return a;
      })
    }));
  }
}));

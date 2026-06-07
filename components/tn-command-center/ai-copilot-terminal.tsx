"use client";

import { useState } from "react";
import { Panel } from "./command-center-primitives";

type CopilotMessage = {
  role: "user" | "ai" | "system";
  content: string;
  action?: {
    name: string;
    args: Record<string, unknown>;
    mode?: string;
    model?: string;
  };
};

type ActionExecutionState = "pending" | "sent";

export function AICopilotTerminal({ telemetryData }: { telemetryData?: Record<string, unknown> }) {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      role: "system",
      content:
        "Advisory copilot initialized. Remote Gemini will be used when available; otherwise the terminal stays in deterministic local demo mode."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [executedActions, setExecutedActions] = useState<Record<string, ActionExecutionState>>({});

  const getActionKey = (action: CopilotMessage["action"]) =>
    `${action?.name}:${JSON.stringify(action?.args ?? {})}`;

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage, telemetryContext: telemetryData })
      });

      const data = await res.json();

      if (data.type === "tool_call") {
        setMessages(prev => [
          ...prev,
          {
            role: "ai",
            content: data.text,
            action: {
              name: data.functionName,
              args: data.args,
              mode: data.source,
              model: data.model
            }
          }
        ]);
      } else {
        setMessages(prev => [...prev, { role: "ai", content: data.text || data.error }]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: "system",
          content: "ERROR: Advisory route is unavailable. No remote or local automation action was executed."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async (action: NonNullable<CopilotMessage["action"]>) => {
    const actionKey = getActionKey(action);
    if (executedActions[actionKey]) return;

    setExecutedActions(prev => ({ ...prev, [actionKey]: "pending" }));
    setMessages(prev => [
      ...prev,
      {
        role: "system",
        content: `SIMULATED TRANSMISSION: ${action.name} staged locally for operator review. No AWS IoT or machine write was performed.`
      }
    ]);

    setTimeout(() => {
      setExecutedActions(prev => ({ ...prev, [actionKey]: "sent" }));
      setMessages(prev => [
        ...prev,
        {
          role: "system",
          content: `LOCAL DEMO ONLY: ${action.name} was recorded as an advisory action. Human approval is still required before any real plant-side command.`
        }
      ]);
    }, 900);
  };

  return (
    <Panel title="AI Copilot Terminal" kicker="Gemini / Local Advisory Agent" icon="zap" accent="emerald">
      <div className="flex h-[350px] flex-col overflow-hidden border border-emerald-400/20 bg-black/60 p-3">
        <div className="flex-1 space-y-3 overflow-y-auto pb-2 font-mono text-xs scrollbar-hide">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 ${
                msg.role === "user"
                  ? "text-cyan-300"
                  : msg.role === "system"
                    ? "font-bold text-amber-400"
                    : "text-emerald-100"
              }`}
            >
              <span className="shrink-0">{msg.role === "user" ? ">" : msg.role === "system" ? "[SYS]" : "AI:"}</span>
              <div className="flex-1 whitespace-pre-wrap">
                {msg.content}
                {msg.action && (
                  <div className="mt-3 rounded border border-emerald-400/40 bg-emerald-400/10 p-3 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                    <p className="mb-2 text-[10px] font-bold tracking-widest text-emerald-300">OPERATOR APPROVAL REQUIRED</p>
                    {msg.action.mode === "local_demo" && (
                      <p className="mb-2 text-[10px] uppercase tracking-widest text-amber-300">Local demo fallback active</p>
                    )}
                    <p className="text-slate-300">
                      Function: <span className="font-bold text-white">{msg.action.name}</span>
                    </p>
                    <p className="mt-1 text-slate-300">
                      Args: <span className="text-cyan-200">{JSON.stringify(msg.action.args)}</span>
                    </p>
                    <button
                      onClick={() => executeAction(msg.action!)}
                      disabled={!!executedActions[getActionKey(msg.action)]}
                      className="mt-3 w-full border border-emerald-400/50 bg-emerald-500/20 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-emerald-100 transition-colors hover:bg-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {executedActions[getActionKey(msg.action)] === "pending"
                        ? "Staging advisory action..."
                        : executedActions[getActionKey(msg.action)] === "sent"
                          ? "Recorded in local demo queue"
                          : "Authorize local demo action"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && <div className="animate-pulse font-mono text-xs text-emerald-400">Gemini is reasoning...</div>}
        </div>
        <div className="mt-3 flex gap-2 border-t border-emerald-400/20 pt-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Command the Digital Twin (e.g., 'Lower the spindle RPM to 10k')..."
            className="flex-1 bg-transparent text-xs text-emerald-300 outline-none placeholder:text-emerald-400/40 focus:ring-0"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-emerald-100 transition-colors hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </Panel>
  );
}

"use client";

import { useState } from "react";
import { Panel } from "./command-center-primitives";
import { createClient } from "@supabase/supabase-js";

export function AICopilotTerminal({ telemetryData }: { telemetryData?: any }) {
  const [messages, setMessages] = useState<{ role: "user" | "ai" | "system", content: string, action?: any }[]>([
    { role: "system", content: "Gemini AI Copilot initialized. Ready for diagnostics and control." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input;
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
        setMessages(prev => [...prev, { 
          role: "ai", 
          content: data.text, 
          action: { name: data.functionName, args: data.args } 
        }]);
      } else {
        setMessages(prev => [...prev, { role: "ai", content: data.text || data.error }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "system", content: "ERROR: Connection to Gemini failed. Check API Key." }]);
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async (action: any) => {
    setMessages(prev => [...prev, { role: "system", content: `EXECUTING: ${action.name} over AWS IoT...` }]);
    
    try {
      // In a real app we'd trigger an insert into operator_actions to be picked up by the bridge
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "", 
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
      );
      
      await supabase.from('operator_actions').insert([{
        action_type: action.name,
        payload: action.args,
        status: 'PENDING_AWS_IOT'
      }]);
      
      setTimeout(() => {
        setMessages(prev => [...prev, { role: "system", content: `SUCCESS: Command delivered to edge via AWS IoT.` }]);
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Panel title="AI Copilot Terminal" kicker="Gemini 1.5 Pro Agent" icon="zap" accent="emerald">
      <div className="flex flex-col h-[350px] border border-emerald-400/20 bg-black/60 p-3 overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-3 pb-2 font-mono text-xs scrollbar-hide">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === "user" ? "text-cyan-300" : msg.role === "system" ? "text-amber-400 font-bold" : "text-emerald-100"}`}>
              <span className="shrink-0">{msg.role === "user" ? ">" : msg.role === "system" ? "[SYS]" : "AI:"}</span>
              <div className="whitespace-pre-wrap flex-1">
                {msg.content}
                {msg.action && (
                  <div className="mt-3 border border-emerald-400/40 bg-emerald-400/10 p-3 rounded shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                    <p className="text-emerald-300 font-bold mb-2 tracking-widest text-[10px]">⚠️ OPERATOR APPROVAL REQUIRED</p>
                    <p className="text-slate-300">Function: <span className="text-white font-bold">{msg.action.name}</span></p>
                    <p className="text-slate-300 mt-1">Args: <span className="text-cyan-200">{JSON.stringify(msg.action.args)}</span></p>
                    <button 
                      onClick={() => executeAction(msg.action)}
                      className="mt-3 w-full bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-100 px-3 py-2 border border-emerald-400/50 transition-colors uppercase tracking-widest text-[10px] font-bold"
                    >
                      AUTHORIZE & TRANSMIT VIA AWS IOT
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && <div className="text-emerald-400 animate-pulse font-mono text-xs">Gemini is reasoning...</div>}
        </div>
        <div className="mt-3 flex gap-2 border-t border-emerald-400/20 pt-3">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Command the Digital Twin (e.g., 'Lower the spindle RPM to 10k')..."
            className="flex-1 bg-transparent border-none outline-none text-emerald-300 font-mono text-xs placeholder:text-emerald-400/40 focus:ring-0"
          />
        </div>
      </div>
    </Panel>
  );
}

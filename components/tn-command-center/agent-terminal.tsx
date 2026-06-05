"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAgentSwarmStore } from "@/lib/simulator/use-agent-swarm-store";
import { audioEngine } from "@/lib/simulator/ui-audio-engine";
import { Icon } from "./command-center-primitives";

export function AgentTerminal() {
  const { terminalOpen, closeTerminal, history, executeCommand, toggleTerminal } = useAgentSwarmStore();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto focus input when opened
  useEffect(() => {
    if (terminalOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [terminalOpen]);

  // Global hotkey to toggle terminal (CTRL+K or ~)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === "k") || e.key === "`" || e.key === "~") {
        e.preventDefault();
        toggleTerminal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleTerminal]);

  // Auto scroll to bottom of history
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      }, 50);
    }
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    executeCommand(input);
    audioEngine.playSuccess();
    setInput("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    audioEngine.playKeystroke();
  };

  return (
    <AnimatePresence>
      {terminalOpen && (
        <motion.div
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-[100] border-b border-cyan-400/50 bg-black/80 backdrop-blur-3xl shadow-[0_10px_40px_rgba(0,212,255,0.15)] font-mono flex flex-col h-[40vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-cyan-400/20 bg-cyan-900/20">
            <div className="flex items-center gap-2">
              <Icon name="mission" className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Agent Swarm Command Center</span>
            </div>
            <button 
              onClick={closeTerminal}
              className="text-cyan-400/60 hover:text-cyan-400 p-1 transition-colors"
            >
              <Icon name="arrow" className="w-4 h-4 rotate-180" />
            </button>
          </div>

          {/* Output History */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar text-xs pb-10">
            {history.map((line, i) => (
              <div 
                key={i} 
                className={`${line.startsWith(">") ? "text-cyan-200 font-bold mt-2" : "text-cyan-400/80 ml-4"}`}
              >
                <TypewriterLine text={line} />
              </div>
            ))}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-cyan-400/20 bg-black/60 flex items-center gap-3 shrink-0">
            <span className="text-cyan-400 font-bold">root@nakashima:~#</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              className="flex-1 bg-transparent border-none outline-none text-cyan-200 text-sm placeholder:text-cyan-400/30 font-mono caret-cyan-400"
              placeholder="Type 'spawn twin' or 'help'..."
              spellCheck={false}
              autoComplete="off"
            />
            <button type="submit" className="hidden" />
          </form>
          
          {/* Scanline effect */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,212,255,0.05)_1px,transparent_1px)] bg-[size:100%_2px] opacity-20" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TypewriterLine({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let i = 0;
    // Determine speed based on length (hex dumps type fast, normal text types slower)
    const chunkSize = text.length > 50 ? 8 : 2;
    const interval = setInterval(() => {
      i += chunkSize;
      if (i >= text.length) {
        setDisplayed(text);
        setIsTyping(false);
        clearInterval(interval);
      } else {
        setDisplayed(text.substring(0, i));
      }
    }, 15);
    
    return () => clearInterval(interval);
  }, [text]);

  const isHexDump = text.startsWith("0x");

  return (
    <span className={isHexDump ? "text-emerald-400/70 opacity-80" : ""}>
      {displayed}
      {isTyping && <span className="inline-block w-1.5 h-3 bg-cyan-400 ml-0.5 animate-pulse" />}
    </span>
  );
}

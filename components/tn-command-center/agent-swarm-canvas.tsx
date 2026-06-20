"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAgentSwarmStore, SwarmAgent } from "@/lib/simulator/use-agent-swarm-store";
import { Icon, type IconName } from "./command-center-primitives";
import { audioEngine } from "@/lib/simulator/ui-audio-engine";

export function AgentSwarmCanvas() {
  const { agents, setAgentTargets } = useAgentSwarmStore();

  // Agents follow mouse clicks when idle
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Don't intercept clicks, just passively listen to redirect agents
      setAgentTargets(e.clientX, e.clientY);
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, [setAgentTargets]);

  if (agents.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {agents.map((agent) => (
        <TwinHelper key={agent.id} agent={agent} />
      ))}
    </div>
  );
}

function TwinHelper({ agent }: { agent: SwarmAgent }) {
  // Add some random jitter to the target so they don't all stack perfectly
  const [jitterX, setJitterX] = useState(0);
  const [jitterY, setJitterY] = useState(0);
  const [domX, setDomX] = useState<number | null>(null);
  const [domY, setDomY] = useState<number | null>(null);
  const hasTarget = Boolean(agent.assignedTargetId);

  useEffect(() => {
    const interval = setInterval(() => {
      setJitterX((Math.random() - 0.5) * 80);
      setJitterY((Math.random() - 0.5) * 80);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // DOM Targeting Loop
  useEffect(() => {
    if (!hasTarget) return;

    let animationFrameId: number;

    const trackDomElement = () => {
      const el = document.getElementById(agent.assignedTargetId as string);
      if (el) {
        const rect = el.getBoundingClientRect();
        // Target the center of the DOM element
        setDomX(rect.left + rect.width / 2);
        setDomY(rect.top + rect.height / 2);
      }
      animationFrameId = requestAnimationFrame(trackDomElement);
    };

    trackDomElement();
    return () => cancelAnimationFrame(animationFrameId);
  }, [agent.assignedTargetId, hasTarget]);

  let colorClass = "text-cyan-400 border-cyan-400/50 bg-cyan-400/10 shadow-[0_0_15px_rgba(0,212,255,0.5)]";
  let iconName: IconName = "search";

  switch (agent.type) {
    case "fixer":
      colorClass = "text-emerald-400 border-emerald-400/50 bg-emerald-400/10 shadow-[0_0_15px_rgba(16,185,129,0.5)]";
      iconName = "check";
      break;
    case "guardian":
      colorClass = "text-amber-400 border-amber-400/50 bg-amber-400/10 shadow-[0_0_15px_rgba(245,158,11,0.5)]";
      iconName = "shield";
      break;
    case "analyst":
      colorClass = "text-purple-400 border-purple-400/50 bg-purple-400/10 shadow-[0_0_15px_rgba(168,85,247,0.5)]";
      iconName = "chart";
      break;
  }

  const finalX = (domX !== null ? domX : agent.targetX) + jitterX;
  const finalY = (domY !== null ? domY : agent.targetY) + jitterY;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        x: finalX,
        y: finalY,
        scale: 1,
        opacity: 1
      }}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 15,
        mass: 1.5,
        restDelta: 0.001
      }}
      className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      // whileHover={{ scale: 1.1 }}
      // onMouseEnter={() => audioEngine.playHover()}
    >
      <div className="relative flex flex-col items-center group">
        {/* The orb */}
        <div className={`relative flex h-8 w-8 items-center justify-center rounded-full border ${colorClass} backdrop-blur-md transition-all duration-300 group-hover:scale-110`}>
          <Icon name={iconName} className="h-4 w-4" />
          
          {/* Status indicator ping */}
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${agent.status === 'working' ? 'bg-amber-400' : 'bg-cyan-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${agent.status === 'working' ? 'bg-amber-500' : 'bg-cyan-500'}`}></span>
          </span>
        </div>

        {/* Floating status label */}
        <div className="absolute top-full left-1/2 mt-2 -translate-x-1/2 whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="rounded border border-white/10 bg-black/80 px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-white backdrop-blur-md">
            {agent.id} | {agent.message}
          </div>
        </div>

        {/* Help Tip Speech Bubble */}
        {agent.helpTip && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1, type: "spring" }}
            className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2 whitespace-nowrap z-50"
          >
            <div className="rounded-lg border border-cyan-400/50 bg-black/90 px-3 py-2 text-[10px] font-mono text-cyan-200 backdrop-blur-xl shadow-[0_0_20px_rgba(0,212,255,0.2)]">
              <span className="font-bold text-cyan-400 mr-2">TN-AGENT:</span>
              {agent.helpTip}
              {/* Speech bubble tail */}
              <div className="absolute top-full left-1/2 -mt-[1px] -translate-x-1/2 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-cyan-400/50"></div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

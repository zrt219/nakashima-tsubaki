"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLearning } from "./LearningContext";
import { Icon } from "@/components/tn-command-center/command-center-primitives";
import { ACADEMIC_CURRICULUM, CurriculumModule } from "@/lib/academic-curriculum";

export function AcademicOverlay() {
  const { isLearningMode, activeTopic, setActiveTopic } = useLearning();
  const [activeTab, setActiveTab] = useState<"abstract" | "methodology" | "architecture" | "code">("abstract");

  if (!isLearningMode || !activeTopic || !ACADEMIC_CURRICULUM[activeTopic]) return null;

  const topic: CurriculumModule = ACADEMIC_CURRICULUM[activeTopic];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="fixed inset-x-4 bottom-4 top-24 z-[100] md:inset-x-24 md:bottom-24 lg:left-auto lg:right-12 lg:w-[800px] border border-fuchsia-500/50 bg-black/95 p-0 shadow-[0_0_80px_rgba(217,70,239,0.2)] backdrop-blur-2xl flex flex-col overflow-hidden rounded-xl"
      >
        {/* Header */}
        <div className="bg-fuchsia-950/30 border-b border-fuchsia-500/30 p-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Icon name="book" className="h-4 w-4 text-fuchsia-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-fuchsia-400">{topic.title}</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1 leading-tight">{topic.paperTitle}</h2>
            <p className="text-xs text-fuchsia-200/80 font-mono">
              {topic.authors} • {topic.journal} ({topic.year})
            </p>
          </div>
          <button onClick={() => setActiveTopic(null)} className="p-2 text-fuchsia-400 hover:text-white hover:bg-fuchsia-500/20 rounded-md transition">
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-black/50">
          {[
            { id: "abstract", label: "Abstract" },
            { id: "methodology", label: "Methodology" },
            { id: "architecture", label: "Architecture" },
            { id: "code", label: "Code Implementation" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition ${
                activeTab === tab.id
                  ? "border-b-2 border-fuchsia-400 text-fuchsia-300 bg-fuchsia-500/10"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="prose prose-invert prose-fuchsia max-w-none">
            {activeTab === "abstract" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-slate-300 text-sm leading-relaxed">
                <p className="text-lg text-fuchsia-100 font-medium leading-relaxed">{topic.abstract}</p>
                <div className="mt-8 border-t border-fuchsia-500/20 pt-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-500 mb-4">Official Citations</h4>
                  <ul className="space-y-3">
                    {topic.citations.map((cite, i) => (
                      <li key={i} className="text-xs text-fuchsia-200/60 pl-4 border-l-2 border-fuchsia-500/30 flex items-start gap-2">
                         <Icon name="tag" className="h-3 w-3 mt-0.5 shrink-0" />
                         {cite}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
            
            {activeTab === "methodology" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-300 text-sm leading-relaxed text-lg font-medium">
                {topic.methodology}
              </motion.div>
            )}

            {activeTab === "architecture" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-300 text-sm leading-relaxed text-lg font-medium">
                {topic.architecture}
              </motion.div>
            )}

            {activeTab === "code" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="bg-command-line/10 border border-command-line/30 p-4 rounded-md">
                  <div className="flex items-center gap-2 mb-3 border-b border-command-line/20 pb-2">
                     <Icon name="cpu" className="h-4 w-4 text-command-muted" />
                     <span className="text-xs font-mono text-command-muted uppercase tracking-widest">Engineering Translation</span>
                  </div>
                  <p className="text-command-text font-mono text-sm leading-relaxed">
                    {topic.codeImplementation}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function LearningTrigger({ topic, children, className = "" }: { topic: string; children: React.ReactNode; className?: string }) {
  const { isLearningMode, setActiveTopic, activeTopic } = useLearning();
  
  if (!isLearningMode) return <>{children}</>;

  const isActive = activeTopic === topic;

  return (
    <div 
      className={`relative cursor-pointer transition-all duration-300 ${isActive ? 'ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-black bg-fuchsia-500/10' : 'hover:ring-1 hover:ring-fuchsia-500/50'} ${className}`}
      onClick={() => setActiveTopic(topic)}
    >
      {/* Educational pulsing beacon */}
      <div className="absolute -top-2 -right-2 z-[60] flex h-5 w-5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-5 w-5 bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.8)] items-center justify-center">
            <Icon name="book" className="h-2.5 w-2.5 text-white" />
        </span>
      </div>
      <div className={isActive ? "opacity-100" : "opacity-90"}>
        {children}
      </div>
    </div>
  );
}

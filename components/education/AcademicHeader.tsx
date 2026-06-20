"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLearning } from "./LearningContext";
import { ACADEMIC_CURRICULUM, CurriculumTopic } from "@/lib/academic-curriculum";
import { BookOpen } from "lucide-react";

interface AcademicHeaderProps {
  topic: CurriculumTopic;
}

export function AcademicHeader({ topic }: AcademicHeaderProps) {
  const { isLearningMode, setActiveTopic } = useLearning();

  const data = ACADEMIC_CURRICULUM[topic];

  return (
    <AnimatePresence>
      {isLearningMode && data && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
          className="mb-8 overflow-hidden rounded-xl border border-cyan-500/30 bg-slate-900/80 shadow-2xl shadow-cyan-900/20 backdrop-blur-md"
        >
          <div className="flex items-start gap-4 p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                {data.title}
              </h2>
              <div className="text-sm font-medium text-cyan-400">
                Primary Reference: {data.paperCitation}
              </div>
              <p className="max-w-4xl text-sm leading-relaxed text-slate-300">
                <span className="font-semibold text-slate-200">Architecture Goal: </span>
                {data.summary}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTopic(topic)}
                  className="inline-flex items-center gap-2 rounded-md bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-500/20"
                >
                  <BookOpen className="h-4 w-4" />
                  Read Academic Deep Dive
                </button>
              </div>
            </div>
          </div>
          {/* Subtle gradient strip at the bottom */}
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500/40 via-blue-500/40 to-transparent" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

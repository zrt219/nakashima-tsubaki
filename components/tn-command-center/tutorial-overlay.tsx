"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTutorialStore, tutorialStore, TUTORIAL_STEPS } from "@/lib/simulator/tutorial-store";
import { Icon } from "./command-center-primitives";

function TypewriterText({ text, speed = 25 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.substring(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return <span>{displayed}</span>;
}

export function TutorialOverlay() {
  const { isActive, currentStepIndex } = useTutorialStore();
  const step = TUTORIAL_STEPS[currentStepIndex];

  const [rect, setRect] = useState<DOMRect | null>(null);

  // Floating animation for the orb
  const [floatY, setFloatY] = useState(0);
  useEffect(() => {
    const i = setInterval(() => {
      setFloatY(Math.sin(Date.now() / 500) * 8);
    }, 50);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (!isActive || !step) return;
    let rafId: number;
    let retries = 0;

    const measure = () => {
      const el = document.getElementById(step.targetElementId);
      if (el) {
        setRect(el.getBoundingClientRect());
        if (step.requireAction) {
          const advance = () => tutorialStore.next();
          el.addEventListener("click", advance, { once: true });
          return () => el.removeEventListener("click", advance);
        }
      } else {
        if (retries < 20) {
          retries++;
          rafId = requestAnimationFrame(measure);
        } else {
          setRect(new DOMRect(window.innerWidth / 2 - 100, window.innerHeight / 2 - 100, 200, 200));
        }
      }
    };

    measure();
    window.addEventListener("resize", measure);
    const interval = setInterval(measure, 500);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", measure);
      clearInterval(interval);
    };
  }, [isActive, step]);

  if (!isActive || !step) return null;

  const isCenter = step.placement === "center" || !rect;

  const top = isCenter ? "50%" : step.placement === "bottom" ? rect.bottom + 20 : step.placement === "top" ? rect.top - 200 : rect.top;
  const left = isCenter ? "50%" : step.placement === "left" ? rect.left - 340 : step.placement === "right" ? rect.right + 20 : rect.left;

  return (
    <AnimatePresence>
      <div className="pointer-events-none fixed inset-0 z-[9999]">
        {/* Subtle spotlight focus on the element */}
        {!isCenter && rect && (
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute rounded-lg border-2 border-cyan-400/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"
          />
        )}
        
        {/* The Sentient Orb & Chat Bubble */}
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, y: floatY }}
          transition={{ layout: { type: "spring", stiffness: 300, damping: 30 } }}
          className="pointer-events-auto absolute flex items-start gap-4"
          style={{ top, left, transform: isCenter ? "translate(-50%, -50%)" : "none" }}
        >
          {/* Glowing Sentient Orb Mascot */}
          <div className="relative mt-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-blue-600 shadow-[0_0_30px_rgba(0,212,255,0.8)] border border-white/20">
            <div className="h-6 w-6 rounded-full bg-white/80 blur-sm animate-pulse" />
            <div className="absolute inset-0 rounded-full border border-cyan-200/50" />
          </div>

          {/* Chat Bubble Tooltip */}
          <div className="relative flex w-80 flex-col gap-3 overflow-hidden rounded-xl border border-cyan-400/30 bg-[#0c1222]/90 p-5 shadow-[0_0_40px_rgba(0,212,255,0.15)] backdrop-blur-xl">
            {/* Pointer Triangle */}
            <div className="absolute top-6 -left-2 h-4 w-4 rotate-45 border-b border-l border-cyan-400/30 bg-[#0c1222]" />

            <div className="flex items-center justify-between z-10">
              <span className="text-[10px] font-bold tracking-[0.2em] text-cyan-400">
                AI SUB-AGENT
              </span>
              <button
                onClick={() => tutorialStore.finish()}
                className="text-slate-400 transition-colors hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="z-10">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300 min-h-[80px]">
                <TypewriterText text={step.description} />
              </p>
            </div>

            <div className="mt-1 flex items-center justify-between z-10">
              {currentStepIndex > 0 ? (
                <button onClick={() => tutorialStore.prev()} className="text-xs font-semibold text-slate-400 hover:text-white">
                  &larr; Back
                </button>
              ) : <div />}

              {!step.requireAction ? (
                <button onClick={() => tutorialStore.next()} className="btn-glow rounded-md bg-cyan-500/20 px-3 py-1.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/30 border border-cyan-500/30">
                  Proceed
                </button>
              ) : (
                <span className="animate-pulse text-xs font-semibold text-cyan-400/80">
                  Awaiting your input...
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTutorialStore, tutorialStore, TUTORIAL_STEPS } from "@/lib/simulator/tutorial-store";
import { Icon } from "./command-center-primitives";

export function TutorialOverlay() {
  const { isActive, currentStepIndex } = useTutorialStore();
  const step = TUTORIAL_STEPS[currentStepIndex];

  const [rect, setRect] = useState<DOMRect | null>(null);

  // Re-calculate the rect whenever the step changes or window resizes
  useEffect(() => {
    if (!isActive || !step) return;

    let rafId: number;
    let retries = 0;

    const measure = () => {
      const el = document.getElementById(step.targetElementId);
      if (el) {
        setRect(el.getBoundingClientRect());
        
        // If requireAction is true, add click listener to the element to auto-advance
        if (step.requireAction) {
          const advance = () => {
            tutorialStore.next();
          };
          el.addEventListener("click", advance, { once: true });
          return () => {
            el.removeEventListener("click", advance);
          };
        }
      } else {
        if (retries < 20) {
          retries++;
          rafId = requestAnimationFrame(measure);
        } else {
          // Fallback to center screen if element never mounts
          setRect(new DOMRect(window.innerWidth / 2 - 100, window.innerHeight / 2 - 100, 200, 200));
        }
      }
    };

    measure();
    window.addEventListener("resize", measure);
    // Poll slowly just in case the element moves due to layout shifts
    const interval = setInterval(measure, 500);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", measure);
      clearInterval(interval);
    };
  }, [isActive, step]);

  if (!isActive || !step) return null;

  // Use a giant shadow for the mask, or if center placement, just full overlay
  const isCenter = step.placement === "center" || !rect;

  const targetStyle = isCenter
    ? {
        top: "50%",
        left: "50%",
        width: 0,
        height: 0,
        x: "-50%",
        y: "-50%"
      }
    : {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        x: 0,
        y: 0
      };

  return (
    <AnimatePresence>
      <div className="pointer-events-none fixed inset-0 z-[9999]">
        {/* The Spotlight Hole */}
        <motion.div
          layout
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            ...targetStyle
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute rounded-lg border-2 border-cyan-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.85),0_0_20px_rgba(0,212,255,0.5)]"
        />

        {/* The Tooltip Card */}
        <motion.div
          layout
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.1 }}
          className="pointer-events-auto absolute flex w-80 flex-col gap-3 overflow-hidden border border-cyan-400/50 bg-black/80 p-5 shadow-[0_0_40px_rgba(0,212,255,0.2)] backdrop-blur-xl"
          style={{
            top: isCenter ? "50%" : step.placement === "bottom" ? rect.bottom + 20 : step.placement === "top" ? rect.top - 200 : rect.top,
            left: isCenter ? "50%" : step.placement === "left" ? rect.left - 340 : step.placement === "right" ? rect.right + 20 : rect.left,
            transform: isCenter ? "translate(-50%, -50%)" : "none"
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Guided Tour • {currentStepIndex + 1}/{TUTORIAL_STEPS.length}
            </span>
            <button
              onClick={() => tutorialStore.finish()}
              className="text-command-muted transition-colors hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white">{step.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{step.description}</p>
          </div>

          <div className="mt-2 flex items-center justify-between">
            {currentStepIndex > 0 ? (
              <button
                onClick={() => tutorialStore.prev()}
                className="text-xs font-semibold text-command-muted transition hover:text-white"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {!step.requireAction ? (
              <button
                onClick={() => tutorialStore.next()}
                className="btn-glow flex items-center gap-2 border border-cyan-400/40 bg-cyan-400/[0.1] px-4 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/[0.2]"
              >
                Next Step
                <Icon name="arrow" className="h-3.5 w-3.5 -rotate-90" />
              </button>
            ) : (
              <span className="animate-pulse text-xs font-semibold text-cyan-400/80">
                Click highlighted area to advance...
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

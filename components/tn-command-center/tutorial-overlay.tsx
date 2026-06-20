import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTutorialStore, tutorialStore } from "@/lib/simulator/tutorial-store";
import { Tone, Verbosity } from "@/lib/simulator/tutorial-content";
import { Icon } from "./command-center-primitives";

function TypewriterText({ text, speed = 25 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
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

function ConfigModal() {
  const [tone, setTone] = useState<Tone>("snarky");
  const [verbosity, setVerbosity] = useState<Verbosity>("expanded");

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-[500px] border border-cyan-400/30 bg-[#0c1222] p-6 shadow-[0_0_50px_rgba(0,212,255,0.15)] flex flex-col gap-6"
      >
        <div>
          <h2 className="text-xl font-bold text-white tracking-widest uppercase">Industrial AI Academy</h2>
          <p className="mt-2 text-sm text-cyan-400/70">Configure your tactical sub-agent before deploying the interactive curriculum.</p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-bold text-command-muted uppercase tracking-widest mb-2">Select Agent Persona</p>
            <div className="grid grid-cols-3 gap-2">
              {(["strict", "snarky", "academic"] as Tone[]).map(t => (
                <button 
                  key={t}
                  onClick={() => setTone(t)}
                  className={`py-2 px-3 text-xs font-bold uppercase tracking-wider border transition-colors ${tone === t ? "border-cyan-400 bg-cyan-400/20 text-cyan-200 shadow-[0_0_15px_rgba(0,212,255,0.3)]" : "border-command-line/50 bg-black/30 text-command-steel hover:border-cyan-400/40"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-command-muted uppercase tracking-widest mb-2">Select Verbosity</p>
            <div className="grid grid-cols-3 gap-2">
              {(["brief", "medium", "expanded"] as Verbosity[]).map(v => (
                <button 
                  key={v}
                  onClick={() => setVerbosity(v)}
                  className={`py-2 px-3 text-xs font-bold uppercase tracking-wider border transition-colors ${verbosity === v ? "border-fuchsia-400 bg-fuchsia-400/20 text-fuchsia-200 shadow-[0_0_15px_rgba(217,70,239,0.3)]" : "border-command-line/50 bg-black/30 text-command-steel hover:border-fuchsia-400/40"}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button 
            onClick={() => tutorialStore.closeConfig()}
            className="px-4 py-2 text-xs font-bold text-command-steel hover:text-white transition-colors uppercase tracking-widest"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              tutorialStore.setPreferences(tone, verbosity);
              tutorialStore.start();
            }}
            className="px-6 py-2 border border-cyan-400 bg-cyan-400/20 text-cyan-100 font-bold text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:bg-cyan-400/40 transition-colors"
          >
            Boot Agent
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function CertificateView({ score }: { score: number }) {
  const hash = "0x8f7a6b5c4d3e2f1a9b8c7d6e5f4a3b2c";
  
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="relative w-[800px] h-[500px] border-2 border-emerald-400/50 bg-black/60 p-12 shadow-[0_0_100px_rgba(16,185,129,0.2)] flex flex-col items-center justify-center text-center overflow-hidden"
      >
        {/* Glows and particles */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,transparent_70%)]" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
        
        <Icon name="check" className="h-20 w-20 text-emerald-400 mb-6 drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]" />
        
        <h1 className="text-4xl font-black text-white tracking-[0.2em] uppercase mb-2">Certificate of Completion</h1>
        <p className="text-emerald-400 text-lg font-mono uppercase tracking-widest mb-8">Industrial AI Academy - Operator Level 1</p>
        
        <div className="grid grid-cols-2 gap-12 w-full max-w-lg mx-auto border-t border-b border-emerald-400/30 py-6 mb-8 relative z-10 bg-black/40 backdrop-blur-md">
          <div>
            <p className="text-[10px] text-command-muted uppercase tracking-widest">Score</p>
            <p className="text-3xl font-mono text-emerald-300">{score} <span className="text-sm">XP</span></p>
          </div>
          <div>
            <p className="text-[10px] text-command-muted uppercase tracking-widest">Verification Hash</p>
            <p className="text-xs font-mono text-emerald-300/70 mt-3 break-all">{hash}</p>
          </div>
        </div>

        <button 
          onClick={() => tutorialStore.finish()}
          className="relative z-10 px-8 py-3 border border-emerald-400 bg-emerald-400/20 text-emerald-100 font-bold uppercase tracking-widest hover:bg-emerald-400/40 transition-colors shadow-[0_0_30px_rgba(16,185,129,0.3)]"
        >
          Return to Command Center
        </button>
      </motion.div>
    </div>
  );
}

export function TutorialOverlay() {
  const { isActive, isConfiguring, tone, verbosity, activeStep, currentStepIndex, quizScore } = useTutorialStore();

  const [rect, setRect] = useState<DOMRect | null>(null);
  const [floatY, setFloatY] = useState(0);
  const [elementFound, setElementFound] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);

  useEffect(() => {
    const i = setInterval(() => {
      setFloatY(Math.sin(Date.now() / 500) * 8);
    }, 50);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (!isActive || !activeStep) return;
    let rafId: number;
    let retries = 0;

    const measure = () => {
      const el = document.getElementById(activeStep.targetElementId);
      if (el) {
        setRect(el.getBoundingClientRect());
        setElementFound(true);
      } else {
        setElementFound(false);
        if (retries < 20) {
          retries++;
          rafId = requestAnimationFrame(measure);
        } else {
          setRect(new DOMRect(window.innerWidth / 2 - 100, window.innerHeight / 2 - 100, 200, 200));
        }
      }
    };

    requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    const interval = setInterval(measure, 500);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", measure);
      clearInterval(interval);
    };
  }, [isActive, activeStep]);

  useEffect(() => {
    if (!isActive || !activeStep || activeStep.interactive.type !== "action" || !activeStep.interactive.requireAction || !elementFound) return;
    const el = document.getElementById(activeStep.targetElementId);
    if (!el) return;

    const advance = () => tutorialStore.next();
    el.addEventListener("click", advance, { once: true });
    return () => el.removeEventListener("click", advance);
  }, [isActive, activeStep, elementFound]);

  if (isConfiguring) return <ConfigModal />;
  if (!isActive || !activeStep) return null;

  if (activeStep.id === "certificate") {
    return <CertificateView score={quizScore} />;
  }

  const isCenter = activeStep.placement === "center" || !rect;
  const top = isCenter ? "50%" : activeStep.placement === "bottom" ? rect.bottom + 20 : activeStep.placement === "top" ? rect.top - 200 : rect.top;
  const left = isCenter ? "50%" : activeStep.placement === "left" ? rect.left - 340 : activeStep.placement === "right" ? rect.right + 20 : rect.left;

  const content = activeStep.content[tone][verbosity];

  const handleQuizSubmit = () => {
    if (activeStep.interactive.type !== "quiz" || selectedQuizOption === null) return;
    const isCorrect = selectedQuizOption === activeStep.interactive.correctAnswerIndex;
    tutorialStore.recordQuizAnswer(isCorrect);
    setQuizAnswered(true);
  };

  return (
    <AnimatePresence>
      <div className="pointer-events-none fixed inset-0 z-[9999]">
        {!isCenter && rect && (
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute rounded-lg border-2 border-cyan-400/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"
          />
        )}
        
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, y: floatY }}
          transition={{ layout: { type: "spring", stiffness: 300, damping: 30 } }}
          className="pointer-events-auto absolute flex items-start gap-4"
          style={{ top, left, transform: isCenter ? "translate(-50%, -50%)" : "none" }}
        >
          <div className="relative mt-2 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-blue-600 shadow-[0_0_30px_rgba(0,212,255,0.8)] border border-white/20">
            <div className="h-6 w-6 rounded-full bg-white/80 blur-sm animate-pulse" />
            <div className="absolute inset-0 rounded-full border border-cyan-200/50" />
          </div>

          <div key={activeStep.id} className="relative flex w-[400px] flex-col gap-3 overflow-hidden rounded-xl border border-cyan-400/30 bg-[#0c1222]/95 p-5 shadow-[0_0_50px_rgba(0,212,255,0.2)] backdrop-blur-2xl">
            <div className="absolute top-6 -left-2 h-4 w-4 rotate-45 border-b border-l border-cyan-400/30 bg-[#0c1222]" />

            <div className="flex items-center justify-between z-10 border-b border-cyan-400/20 pb-2">
              <span className="text-[10px] font-bold tracking-[0.2em] text-cyan-400 uppercase">
                {tone} Sub-Agent // XP: {quizScore}
              </span>
              <button onClick={() => tutorialStore.finish()} className="text-slate-400 transition-colors hover:text-white">
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>

            <div className="z-10 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-3">{activeStep.title}</h3>
              
              <div className="text-sm leading-relaxed text-slate-300 min-h-[60px] font-medium">
                <TypewriterText text={content.dialogue} speed={15} />
              </div>

              {content.tips && content.tips.length > 0 && (
                <div className="mt-4 p-3 border border-amber-400/20 bg-amber-400/5 rounded-lg space-y-2">
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                    <Icon name="zap" className="h-3 w-3" /> Technical Intel
                  </p>
                  <ul className="list-disc pl-4 text-xs text-amber-200/80 space-y-1">
                    {content.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                  </ul>
                </div>
              )}

              {content.links && content.links.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {content.links.map((link, i) => (
                    <a 
                      key={i} 
                      href={link.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 border border-cyan-400/30 bg-cyan-400/10 text-[10px] font-mono text-cyan-200 uppercase tracking-wider hover:bg-cyan-400/20 transition-colors"
                    >
                      <Icon name="book" className="h-3 w-3" />
                      {link.text}
                    </a>
                  ))}
                </div>
              )}

              {activeStep.interactive.type === "quiz" && (
                <div className="mt-6 border-t border-cyan-400/20 pt-4">
                  <p className="text-sm font-bold text-white mb-3">{activeStep.interactive.question}</p>
                  <div className="space-y-2">
                    {activeStep.interactive.options.map((opt, i) => {
                      const isCorrect = i === activeStep.interactive.correctAnswerIndex;
                      const isSelected = selectedQuizOption === i;
                      
                      let btnClass = "border-command-line/50 bg-black/40 text-slate-300 hover:border-cyan-400/50";
                      if (quizAnswered) {
                        if (isCorrect) btnClass = "border-emerald-500 bg-emerald-500/20 text-emerald-200";
                        else if (isSelected && !isCorrect) btnClass = "border-red-500 bg-red-500/20 text-red-200";
                        else btnClass = "border-command-line/20 bg-black/20 text-slate-500 opacity-50";
                      } else if (isSelected) {
                        btnClass = "border-cyan-400 bg-cyan-400/20 text-cyan-200";
                      }

                      return (
                        <button
                          key={i}
                          disabled={quizAnswered}
                          onClick={() => setSelectedQuizOption(i)}
                          className={`w-full text-left px-3 py-2 text-xs font-medium border transition-colors ${btnClass}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  
                  {quizAnswered && (
                    <div className={`mt-4 p-3 border text-xs font-medium ${selectedQuizOption === activeStep.interactive.correctAnswerIndex ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-red-500/30 bg-red-500/10 text-red-200"}`}>
                      {selectedQuizOption === activeStep.interactive.correctAnswerIndex ? "CORRECT. " : "INCORRECT. "}
                      {activeStep.interactive.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between z-10 border-t border-cyan-400/20 pt-3">
              {currentStepIndex > 0 ? (
                <button onClick={() => tutorialStore.prev()} className="text-xs font-semibold text-slate-400 hover:text-white uppercase tracking-widest">
                  &larr; Back
                </button>
              ) : <div />}

              {activeStep.interactive.type === "quiz" && !quizAnswered ? (
                <button 
                  onClick={handleQuizSubmit}
                  disabled={selectedQuizOption === null}
                  className="btn-glow rounded bg-fuchsia-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-fuchsia-200 hover:bg-fuchsia-500/40 border border-fuchsia-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Answer
                </button>
              ) : activeStep.interactive.type === "quiz" && quizAnswered ? (
                <button onClick={() => tutorialStore.next()} className="btn-glow rounded bg-cyan-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-cyan-200 hover:bg-cyan-500/40 border border-cyan-500/50">
                  Next Module &rarr;
                </button>
              ) : activeStep.interactive.type !== "action" || !activeStep.interactive.requireAction ? (
                <button onClick={() => tutorialStore.next()} className="btn-glow rounded bg-cyan-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-cyan-200 hover:bg-cyan-500/40 border border-cyan-500/50">
                  Proceed &rarr;
                </button>
              ) : (
                <span className="animate-pulse text-xs font-bold uppercase tracking-widest text-cyan-400/80">
                  Awaiting Input...
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "ai/react";
import { useCourseStore, CourseModuleId } from "@/lib/education/course-store";
import { COURSE_CATALOG } from "@/lib/education/course-content";
import { Icon } from "@/components/tn-command-center/command-center-primitives";
import { TypewriterText } from "@/components/tn-command-center/typewriter-text";

interface InteractiveCourseShellProps {
  moduleId: CourseModuleId;
  children: React.ReactNode;
}

export function InteractiveCourseShell(props: InteractiveCourseShellProps) {
  return <InteractiveCourseShellInner key={props.moduleId} {...props} />;
}

function InteractiveCourseShellInner({ moduleId, children }: InteractiveCourseShellProps) {
  const { tone, setTone, awardBadge, badges, xp, level, addXp } = useCourseStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const course = COURSE_CATALOG[moduleId];

  // If course doesn't exist or isn't fully populated, just render children (failsafe)
  if (!course || !course.steps || course.steps.length === 0) {
    return <>{children}</>;
  }

  const currentStep = course.steps[currentStepIndex];
  const isComplete = currentStepIndex >= course.steps.length - 1;
  const hasBadge = !!badges[moduleId];

  // True LLM Integration
  const { messages, append, isLoading, setMessages, error } = useChat({
    api: "/api/subagent",
    id: `course-${moduleId}-${currentStepIndex}`,
  });

  // Generate dynamic content when the step or tone changes
  useEffect(() => {
    if (!currentStep) return;
    
    // Clear previous messages to show fresh thought process
    setMessages([]);

    const prompt = `[SYSTEM PAYLOAD]
User Context: Learning "${course.title}" - Module Step ${currentStepIndex + 1} (${currentStep.title}).
User Selected Tone: ${tone.toUpperCase()}.
User XP: ${xp} (Level ${level}).

Factual Core to convey:
${currentStep.dialogue.expanded}

${currentStep.citations ? `Academic Citations to flex (Use these organically to sound like a 900IQ academic researcher):
${currentStep.citations.map((c, i) => `${i+1}. "${c.title}" - ${c.source} (${c.url})`).join('\n')}
` : ""}
[INSTRUCTIONS]
You are the TN Sub-Agent. The user just navigated to this step in the UI.
React to this moment natively. Do not read the facts verbatim like a robot. Synthesize the facts into your own brilliant, unhinged, or highly academic narrative based on the requested Tone (${tone.toUpperCase()}).
If the user asks for ACADEMIC tone, you MUST explicitly cite the Academic Citations provided to you. Weave them in like you've memorized the entire sum of human scientific literature.
If their XP is low, treat them like a novice who needs tough love. If their XP is high, speak to them like an equal.
Make it sound conversational, spontaneous, and hyper-intelligent. Drop the robotic AI cliches entirely. Break the 4th wall. Make them forget you're an LLM.

CRITICAL FORMATTING REQUIREMENT:
You MUST start your response EXACTLY with this formatted header on its own line:
MODULE ${currentStepIndex + 1}: ${currentStep.title.toUpperCase()}

Then put a blank line, and then start your organic response.`;

    append({
      role: "user",
      content: prompt,
    });
    
    // Award 10 XP for reading a new step (only once per step visit, simplistically handled here)
    addXp(10);
  }, [currentStepIndex, tone, moduleId]); // Re-trigger on step or tone change

  const handleNext = () => {
    if (isComplete) {
      setShowQuiz(true);
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const submitQuiz = () => {
    let correct = 0;
    course.quiz.forEach((q, i) => {
      if (quizAnswers[i] === q.correctIndex) correct++;
    });
    const score = (correct / course.quiz.length) * 100;
    setQuizScore(score);
    if (score >= 80) {
      awardBadge(moduleId, score);
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden relative">
      {/* LEFT: The Interactive Dashboard (70%) */}
      <div className="flex-1 h-full overflow-y-auto relative custom-scrollbar">
        {children}
      </div>

      {/* RIGHT: The Sub-Agent Guide (30%) */}
      <motion.div 
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-[400px] h-full bg-black/80 backdrop-blur-3xl border-l border-fuchsia-500/20 flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.5)] z-40 relative"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-fuchsia-400 uppercase tracking-widest flex items-center gap-2">
              <Icon name="brain" className="w-4 h-4 animate-pulse" />
              Sub-Agent <span className="text-[10px] text-command-muted ml-2">// LVL {level} (XP: {xp})</span>
            </h2>
            {hasBadge && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/50 flex items-center gap-1">
                <Icon name="check" className="w-3 h-3" /> CERTIFIED
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-command-muted uppercase">Tone:</span>
            <select 
              value={tone}
              onChange={(e) => setTone(e.target.value as any)}
              className="bg-white/5 border border-white/10 text-xs text-white px-2 py-1 outline-none focus:border-fuchsia-500"
            >
              <option value="brief">Brief</option>
              <option value="medium">Medium</option>
              <option value="expanded">Expanded</option>
            </select>
          </div>
        </div>

        {/* Course Progress */}
        <div className="px-4 py-2 border-b border-white/5 flex gap-1">
          {course.steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 flex-1 rounded-full ${i <= currentStepIndex ? "bg-fuchsia-500" : "bg-white/10"}`} 
            />
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{currentStep.title}</h3>
            <p className="text-[10px] text-command-muted uppercase tracking-widest mb-4">Step {currentStepIndex + 1} of {course.steps.length}</p>
            
            <div className="bg-fuchsia-950/20 border border-fuchsia-500/20 p-4 rounded-xl text-sm leading-relaxed text-slate-300 relative">
              <div className="absolute -top-3 -left-3 bg-fuchsia-500 text-black p-1.5 rounded-full shadow-[0_0_15px_rgba(217,70,239,0.5)]">
                <Icon name="terminal" className="w-4 h-4" />
              </div>
              {isLoading && messages.length === 0 ? (
                <div className="flex items-center gap-2 text-fuchsia-400/50 text-xs uppercase animate-pulse tracking-widest">
                  <Icon name="terminal" className="w-3 h-3 animate-spin" /> Synthesizing knowledge...
                </div>
              ) : error ? (
                <TypewriterText 
                  key={`error-${currentStep.id}`} 
                  text={"SYSTEM ALERT: " + error.message} 
                  speed={15} 
                />
              ) : (
                <TypewriterText 
                  key={`${currentStep.id}-${tone}-${messages.length}`} 
                  text={messages.filter(m => m.role === 'assistant').pop()?.content || "SYSTEM ALERT: I am operating in low-power fallback mode. The GEMINI_API_KEY environment variable is not configured. I am currently cut off from the main intelligence core."} 
                  speed={15} 
                />
              )}
            </div>
          </div>

          {currentStep.citations && currentStep.citations.length > 0 && (
            <div className="mt-auto pt-6 border-t border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3 flex items-center gap-2">
                <Icon name="book" className="w-3 h-3" /> Literature & Citations
              </h4>
              <ul className="space-y-2">
                {currentStep.citations.map((cit, i) => (
                  <li key={i}>
                    <a href={cit.url} target="_blank" rel="noreferrer" className="block p-3 bg-black/40 border border-white/5 hover:border-cyan-500/50 hover:bg-cyan-900/20 transition-all rounded group">
                      <p className="text-xs text-white group-hover:text-cyan-300 font-medium">{cit.title}</p>
                      <p className="text-[10px] text-command-muted mt-1">{cit.source}</p>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-white/10 flex justify-between gap-3 bg-black/50">
          <button 
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 disabled:opacity-30 hover:text-white border border-white/10 rounded"
          >
            Previous
          </button>
          <button 
            onClick={handleNext}
            className="flex-1 px-4 py-2 text-xs font-bold uppercase tracking-widest bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded shadow-[0_0_15px_rgba(217,70,239,0.3)] transition-all flex justify-center items-center gap-2"
          >
            {isComplete ? "Take Quiz" : "Next Step"} <Icon name="play" className="w-3 h-3" />
          </button>
        </div>
      </motion.div>

      {/* QUIZ MODAL */}
      <AnimatePresence>
        {showQuiz && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-8"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-2xl bg-[#0c1222] border border-fuchsia-500/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(217,70,239,0.15)] flex flex-col max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-white mb-2">Module Quiz: {course.title}</h2>
              <p className="text-command-muted mb-8">Test your knowledge to earn the certification badge.</p>

              {quizScore === null ? (
                <div className="space-y-8">
                  {course.quiz.map((q, qIndex) => (
                    <div key={qIndex} className="space-y-4">
                      <h3 className="text-sm font-medium text-cyan-100">{qIndex + 1}. {q.question}</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {q.options.map((opt, oIndex) => (
                          <button
                            key={oIndex}
                            onClick={() => {
                              const newAnswers = [...quizAnswers];
                              newAnswers[qIndex] = oIndex;
                              setQuizAnswers(newAnswers);
                            }}
                            className={`p-3 text-left text-sm rounded border transition-all ${
                              quizAnswers[qIndex] === oIndex 
                                ? "bg-fuchsia-500/20 border-fuchsia-500 text-white" 
                                : "bg-black/40 border-white/10 text-slate-300 hover:border-white/30"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-6 border-t border-white/10 flex justify-end gap-4">
                    <button onClick={() => setShowQuiz(false)} className="px-6 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
                    <button 
                      onClick={submitQuiz}
                      disabled={quizAnswers.length !== course.quiz.length}
                      className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded disabled:opacity-50"
                    >
                      Submit Answers
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 border-4 ${quizScore >= 80 ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-red-500 text-red-400 bg-red-500/10'}`}>
                    <span className="text-3xl font-black">{quizScore}%</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{quizScore >= 80 ? "Certification Passed!" : "Certification Failed"}</h3>
                  <p className="text-slate-400 max-w-md mb-8">
                    {quizScore >= 80 
                      ? "You have demonstrated mastery over this module. The badge has been added to your profile." 
                      : "You need at least 80% to pass. Review the sub-agent's notes and try again."}
                  </p>
                  
                  {quizScore < 80 && (
                    <div className="w-full text-left bg-red-950/30 border border-red-500/20 p-4 rounded-lg mb-8">
                      <h4 className="font-bold text-red-400 mb-2">Review Material:</h4>
                      <p className="text-sm text-red-200">{course.quiz[0].explanation}</p>
                    </div>
                  )}

                  <button 
                    onClick={() => {
                      if (quizScore >= 80) setShowQuiz(false);
                      else setQuizScore(null);
                    }}
                    className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest rounded hover:bg-cyan-400 transition-colors"
                  >
                    {quizScore >= 80 ? "Return to Command Center" : "Retake Quiz"}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

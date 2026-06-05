"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { type ReactNode, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { missionAreas, type EvidenceItem } from "@/lib/tn-ai-data";
import { ButtonLinkLike, Icon, StatusChip } from "@/components/tn-command-center/command-center-primitives";
import { TutorialOverlay } from "@/components/tn-command-center/tutorial-overlay";

const DataCoreWebGL = dynamic(() => import("@/components/tn-command-center/data-core-webgl"), { ssr: false });

export function CommandCenterShell({
  activeAreaId,
  rightRail,
  eventStream,
  children,
  utilityActions
}: {
  activeAreaId: string;
  rightRail: ReactNode;
  eventStream: EvidenceItem[];
  children: ReactNode;
  utilityActions?: ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-command-black text-command-text">
      
      {/* Global 3D WebGL Background */}
      <DataCoreWebGL />

      {/* Global Interactive Tutorial Overlay */}
      <TutorialOverlay />

      {/* Animated background grid */}
      <div className="fixed inset-0 command-grid opacity-100" aria-hidden="true" />

      {/* Aurora glow orbs */}
      <div
        className="hero-orb fixed h-[500px] w-[500px] animate-[drift_25s_ease-in-out_infinite]"
        style={{
          top: "-10%",
          left: "-5%",
          background: "radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)"
        }}
        aria-hidden="true"
      />
      <div
        className="hero-orb fixed h-[400px] w-[400px] animate-[drift_30s_ease-in-out_infinite_reverse]"
        style={{
          top: "20%",
          right: "-8%",
          background: "radial-gradient(circle, rgba(155,109,255,0.06) 0%, transparent 70%)"
        }}
        aria-hidden="true"
      />
      <div
        className="hero-orb fixed h-[350px] w-[350px] animate-[drift_20s_ease-in-out_infinite_1s]"
        style={{
          bottom: "5%",
          left: "30%",
          background: "radial-gradient(circle, rgba(0,229,160,0.05) 0%, transparent 70%)"
        }}
        aria-hidden="true"
      />

      {/* Content stack */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <CommandHeader utilityActions={utilityActions} />
        <div className="grid flex-1 grid-cols-1 gap-3 px-3 pb-3 lg:grid-cols-[260px_minmax(0,1fr)_300px] lg:px-4">
          <MissionRail activeAreaId={activeAreaId} />
          <section className="min-w-0 space-y-3 animate-[fadeIn_0.5s_ease-out]">
            {children}
          </section>
          <aside className="lg:sticky lg:top-[82px] lg:h-[calc(100vh-128px)]">{rightRail}</aside>
        </div>
        <EventStream items={eventStream} />
      </div>
    </main>
  );
}

function CommandHeader({ utilityActions }: { utilityActions?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-command-line/60 bg-command-black/90 px-4 py-3 backdrop-blur-2xl">
      {/* Header top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
      {/* Animated scanline */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-cyan-400/80 shadow-[0_0_8px_rgba(0,212,255,0.8)] opacity-0 animate-[scan_4s_ease-in-out_infinite]" />

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        {/* Brand */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative grid h-11 w-11 shrink-0 place-items-center border border-cyan-400/30 bg-cyan-400/[0.07] shadow-[0_0_20px_rgba(0,212,255,0.25)] transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,212,255,0.4)]">
            <Icon name="mission" className="h-6 w-6 text-cyan-300 drop-shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
            <span className="absolute top-0 left-0 h-2 w-2 border-t border-l border-cyan-400/80" />
            <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-cyan-400/80" />
            <div className="absolute inset-0 bg-cyan-400/10 opacity-0 transition-opacity duration-300 hover:opacity-100" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-white md:text-xl">
              TN Precision AI{" "}
              <span className="gradient-text-cyan text-glow-cyan">Command Center</span>
            </h1>
            <div className="flex items-center gap-2">
              <p className="truncate text-[10px] font-medium uppercase tracking-[0.2em] text-command-muted">
                RAG · Digital Twins · Blockchain Provenance · Industrial AI
              </p>
              <span className="hidden h-1 w-1 rounded-full bg-cyan-500/50 xl:block" />
              <LiveClock />
            </div>
          </div>
        </div>

        {/* Actions + status pills */}
        <motion.div 
          className="flex flex-wrap items-center gap-2.5"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
        >
          <motion.div variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", bounce: 0.5 } } }}>
            <StatusChip status="simulated" />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", bounce: 0.5 } } }}>
            <StatusChip status="advisory" />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", bounce: 0.5 } } }}>
            <StatusChip status="approval" compact />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", bounce: 0.5 } } }}>
            <StatusChip status="testnet" compact />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", bounce: 0.5 } } }} className="relative overflow-hidden border border-command-line/80 bg-command-panel/80 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-command-steel backdrop-blur-md">
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-cyan-400/50" />
            <span className="text-command-muted">Build:</span>{" "}
            <span className="text-cyan-100 drop-shadow-[0_0_4px_rgba(0,212,255,0.5)]">q-hold sim v1.0</span>
          </motion.div>
          <motion.a 
            href="https://github.com/zrt219" 
            target="_blank" 
            rel="noopener noreferrer"
            variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", bounce: 0.6 } } }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="group relative grid h-[34px] place-items-center gap-2 overflow-hidden border border-cyan-400/30 bg-cyan-400/[0.05] px-3 font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-200 transition-all duration-300 hover:border-cyan-400/60 hover:bg-cyan-400/[0.15] hover:text-white hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]"
          >
            <div className="flex items-center gap-2">
              <Icon name="github" className="h-4 w-4 drop-shadow-[0_0_5px_rgba(0,212,255,0.8)]" />
              <span>@zrt219</span>
            </div>
          </motion.a>
          {utilityActions && (
            <motion.div variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", bounce: 0.5 } } }}>
              {utilityActions}
            </motion.div>
          )}
        </motion.div>
      </div>
    </header>
  );
}

function LiveClock() {
  const [time, setTime] = useState<string>("00:00:00 UTC");
  
  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTime(d.toISOString().split("T")[1].split(".")[0] + " UTC");
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <span className="hidden font-mono text-[10px] text-cyan-400/60 xl:block">
      {time}
    </span>
  );
}

function MissionRail({ activeAreaId }: { activeAreaId: string }) {
  return (
    <aside className="lg:sticky lg:top-[82px] lg:h-[calc(100vh-128px)]">
      <div className="glass-panel relative flex h-full flex-col overflow-hidden">
        {/* Left accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent" />

        <div className="border-b border-command-line/60 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-400/60">
            Mission Navigation
          </p>
          <p className="mt-1.5 text-sm font-medium leading-5 text-slate-300">
            Standards-first industrial AI adoption command surface.
          </p>
        </div>

        <nav className="flex-1 gap-2 space-y-1.5 overflow-y-auto p-3">
          {missionAreas.map((area) => {
            const active = area.id === activeAreaId;

            return (
              <Link
                key={area.id}
                href={area.href}
                aria-label={`${area.index}. ${area.title}: ${area.descriptor}`}
                className={`group relative grid grid-cols-[36px_1fr_auto] items-center gap-3 overflow-hidden border p-2.5 text-left transition-all duration-300 hover:scale-[1.01] ${
                  active
                    ? "border-cyan-400/40 bg-cyan-400/[0.08] text-white shadow-[0_0_16px_rgba(0,212,255,0.12)]"
                    : "border-command-line/50 bg-black/20 text-command-muted hover:border-cyan-400/25 hover:bg-black/40 hover:text-white"
                }`}
              >
                {/* Active left indicator */}
                {active && (
                  <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-cyan-400/80 via-cyan-300 to-cyan-400/80 shadow-[0_0_12px_rgba(0,212,255,0.9)]" />
                )}
                {/* Active top gradient */}
                {active && (
                  <span className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-cyan-400/60 to-transparent" />
                )}

                <div className={`grid h-9 w-9 place-items-center border transition-colors duration-300 ${active ? "border-cyan-400/30 bg-cyan-400/10" : "border-command-line/50 bg-black/30 group-hover:border-cyan-400/30"}`}>
                  <span className={`font-mono text-[10px] ${active ? "text-cyan-200" : "text-command-steel"}`}>{area.index}</span>
                </div>
                
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <Icon
                      name={area.icon as Parameters<typeof Icon>[0]["name"]}
                      className={`h-3.5 w-3.5 shrink-0 transition-colors duration-300 ${
                        active ? "text-cyan-300 drop-shadow-[0_0_5px_rgba(0,212,255,0.8)]" : "text-command-steel group-hover:text-cyan-400/60"
                      }`}
                    />
                    <span className="truncate">{area.title}</span>
                  </span>
                  <span className={`mt-0.5 block truncate text-[10px] uppercase tracking-[0.1em] ${active ? "text-cyan-100/70" : "text-command-muted"}`}>
                    {area.descriptor}
                  </span>
                </span>

                {/* Active indicator dot */}
                <span
                  className={`relative flex h-1.5 w-1.5 shrink-0 transition-all duration-300`}
                >
                  {active && (
                    <span className="status-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-60" />
                  )}
                  <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${active ? "bg-cyan-300 shadow-[0_0_8px_rgba(0,212,255,0.9)]" : "bg-command-steel/30"}`} />
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom system status */}
        <div className="border-t border-command-line/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="status-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-command-muted">
              System nominal
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function EventStream({ items }: { items: EvidenceItem[] }) {
  return (
    <footer className="relative border-t border-command-line/60 bg-command-black/80 px-4 py-3 backdrop-blur-xl">
      {/* Top shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />

      <div className="flex flex-col gap-3 xl:flex-row xl:items-start">
        <div className="shrink-0 xl:w-36">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="status-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-command-muted">
              Live stream
            </p>
          </div>
          <p className="mt-1 text-sm font-medium text-white">Command Evidence</p>
        </div>

        <div className="grid min-w-0 flex-1 gap-2 xl:grid-cols-4 2xl:grid-cols-5">
          {items.map((item) => (
            <article
              key={`${item.timestamp}-${item.event}`}
              className="event-card relative overflow-hidden border border-command-line/70 bg-black/40 px-3 py-2 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-cyan-400/40 hover:bg-black/60 hover:shadow-[0_0_15px_rgba(0,212,255,0.1)]"
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] text-command-steel">{item.timestamp}</span>
                <StatusChip status={item.status} compact />
              </div>
              <p className="mt-1.5 truncate text-xs font-semibold text-white group-hover:text-cyan-100">{item.event}</p>
              <p className="mt-0.5 truncate text-[10px] uppercase tracking-[0.05em] text-command-muted">
                <span className="text-cyan-400/50">{item.source}</span>: {item.payload}
              </p>
            </article>
          ))}
        </div>
      </div>
    </footer>
  );
}

export function ShellActionLink({
  href,
  label,
  tone = "primary"
}: {
  href: string;
  label: string;
  tone?: "primary" | "secondary";
}) {
  return (
    <Link href={href}>
      <ButtonLinkLike tone={tone}>
        <Icon name={tone === "primary" ? "play" : "arrow"} className="h-3.5 w-3.5" />
        <span>{label}</span>
      </ButtonLinkLike>
    </Link>
  );
}

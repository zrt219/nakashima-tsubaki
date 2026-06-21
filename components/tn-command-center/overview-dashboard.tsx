"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { overviewEvents, overviewKpis } from "@/lib/tn-ai-data";
import { useSimulatorStore } from "@/lib/simulator/store";
import { CommandCenterShell, ShellActionLink } from "@/components/tn-command-center/command-center-shell";
import { Icon, StatusChip, type IconName } from "@/components/tn-command-center/command-center-primitives";
import { AICopilotTerminal } from "@/components/tn-command-center/ai-copilot-terminal";
import { InteractiveCourseShell } from "@/components/education/InteractiveCourseShell";
import { LearningTrigger } from "@/components/education/AcademicOverlay";

type OverviewAsset = {
  asset_type: string;
  name: string;
  operational_status: string;
};

type OverviewSignal = {
  value_numeric?: number | null;
  quality?: string;
};

type OverviewTelemetry = {
  speed?: OverviewSignal | null;
  temp?: OverviewSignal | null;
  vib?: OverviewSignal | null;
};

type ScenarioSummary = {
  id: string;
  name: string;
};

const seededValue = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export function OverviewDashboard({ asset, telemetryData, scenarios }: { asset?: OverviewAsset; telemetryData?: OverviewTelemetry; scenarios?: ScenarioSummary[] }) {
  const { runId: latestRunId, state: latestRunState } = useSimulatorStore();
  const latestRun = { id: latestRunId, state: latestRunState };
  const router = useRouter();

  useEffect(() => {
    // Poll for new live data every 5 seconds
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <CommandCenterShell
      activeAreaId="overview"
      eventStream={overviewEvents}
      utilityActions={
        <>
          <ShellActionLink href="/simulator" label="Launch Twin Simulator" />
        </>
      }
      rightRail={<OverviewRail latestRun={latestRun} />}
    >
      <InteractiveCourseShell moduleId="overview">
        <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto custom-scrollbar">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <OverviewHero latestRun={latestRun} asset={asset} />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      >
        <DigitalTwinCanvas telemetryData={telemetryData} />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
      >
        <TelemetryBar telemetryData={telemetryData} />
      </motion.div>
      
      <motion.div 
        className="grid gap-3 xl:grid-cols-[1fr_1.5fr_1fr]"
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, delay: 0.5, staggerChildren: 0.1, ease: "easeOut" }}
      >
        <ReplayableScenariosPanel latestRun={latestRun} scenarios={scenarios} />
        <ProductionTraceabilityPanel latestRun={latestRun} />
        <LiveEventLedgerPanel />
      </motion.div>

      <div className="mt-3">
        <AICopilotTerminal telemetryData={telemetryData} />
      </div>
        </div>
      </InteractiveCourseShell>
    </CommandCenterShell>
  );
}

function OverviewHero({ latestRun, asset }: { latestRun: { id: string, state: string } | null, asset?: OverviewAsset }) {
  return (
    <section className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 p-2">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          Nakashima-Tsubaki
        </h2>
        <h3 className="mt-1 text-2xl font-bold text-cyan-400 drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]">
          Digital Twin Command Center
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Replayable industrial intelligence for precision manufacturing, quality control, and operator-safe workflow decisions.
        </p>
        {asset && (
          <div className="mt-2 inline-flex items-center gap-2 border border-emerald-500/50 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 backdrop-blur-md">
             <Icon name="check" className="h-3 w-3" />
             Connected to Supabase {asset.asset_type}: {asset.name} ({asset.operational_status})
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-200">
            <Icon name="flow" className="h-4 w-4" /> DIGITAL TWIN
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-200">
            <Icon name="play" className="h-4 w-4" /> REPLAYABLE
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-200">
            <Icon name="check" className="h-4 w-4" /> QUALITY
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-200">
            <Icon name="search" className="h-4 w-4" /> TRACEABILITY
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/simulator?tutorial=true"
            className="group relative inline-flex h-12 items-center justify-center gap-3 overflow-hidden rounded bg-cyan-500 hover:bg-cyan-400 px-8 font-mono text-sm font-black uppercase tracking-widest text-black transition-all duration-300 shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:shadow-[0_0_60px_rgba(0,212,255,0.8)]"
          >
            <Icon name="play" className="h-5 w-5 animate-pulse" />
            Launch Interactive Academy
          </Link>
          <Link
            href="/tutorials"
            className="group relative inline-flex h-12 items-center justify-center gap-3 overflow-hidden rounded border border-cyan-500/50 bg-black/40 hover:bg-cyan-500/10 px-8 font-mono text-sm font-bold uppercase tracking-widest text-cyan-400 transition-all duration-300"
          >
            <Icon name="book" className="h-5 w-5" />
            View Curriculum
          </Link>
        </div>
      </div>
      
      {/* Active Milestone Block */}
      <div className="relative w-full max-w-sm overflow-hidden border border-command-line/80 bg-black/40 p-4 shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-command-muted">Active Milestone</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center border border-amber-400/30 bg-amber-400/[0.1]">
            <Icon name="flow" className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Quality Hold Gate – Dimensional</p>
            <p className="text-[10px] text-command-steel">Lot NT-2025-0517-AX12</p>
          </div>
        </div>
        <div className="mt-4 space-y-1 font-mono text-[10px]">
          <div className="flex justify-between">
            <span className="text-command-steel">Mode</span>
            <span className="text-white">LOCAL PERSISTENCE</span>
          </div>
          <div className="flex justify-between">
            <span className="text-command-steel">Scenario</span>
            <span className="text-white">3 - FINISH TURNING</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function NetworkPing() {
  const [latency, setLatency] = useState(18);
  const [throughput, setThroughput] = useState(14.2);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(12 + Math.floor(Math.random() * 15));
      setThroughput(14 + (Math.random() * 8));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mt-2 z-20 flex items-center gap-4 text-[10px] font-mono">
      <div className="flex items-center gap-1">
        <Icon name="arrow" className="h-3 w-3 text-cyan-400" />
        <span className="text-command-steel">LATENCY:</span>
        <span className="text-cyan-300 font-bold">{latency} ms</span>
      </div>
      <div className="flex items-center gap-1">
        <Icon name="database" className="h-3 w-3 text-cyan-400" />
        <span className="text-command-steel">IO:</span>
        <span className="text-cyan-300 font-bold">{throughput.toFixed(1)} MB/s</span>
      </div>
    </div>
  );
}

function DigitalTwinCanvas({ telemetryData }: { telemetryData?: OverviewTelemetry }) {
  const [timeline, setTimeline] = useState(100); // 100 is present, 0 is past
  const isCritical = timeline < 30; // Simulate an anomaly in the past

  // Fallback values if real data isn't available
  const currentSpeed = telemetryData?.speed?.value_numeric ? Math.round(telemetryData.speed.value_numeric).toLocaleString() : "12,450";
  const currentTemp = telemetryData?.temp?.value_numeric ? Number(telemetryData.temp.value_numeric).toFixed(1) : "20.6";
  const currentVib = telemetryData?.vib?.value_numeric ? Number(telemetryData.vib.value_numeric).toFixed(2) : "1.42";

  return (
    <LearningTrigger topic="what_is_nakashima" className="relative mt-2 flex min-h-[500px] w-full flex-col overflow-hidden border border-cyan-400/20 bg-black/30 p-4 shadow-[0_0_30px_rgba(0,212,255,0.02)] backdrop-blur-md">
      {/* Scanline FX */}
      <div className={`absolute top-0 left-0 right-0 h-[1px] ${isCritical ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "bg-cyan-400/80 shadow-[0_0_8px_rgba(0,212,255,0.8)]"} opacity-0 animate-[scan_4s_ease-in-out_infinite]`} />
      
      {/* Header */}
      <div className="relative z-20 flex items-center justify-between">
        <p className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${isCritical ? "text-red-400" : "text-cyan-400/80"}`}>
          {isCritical ? "HISTORICAL ANOMALY DETECTED - CNC CELL" : "ACTIVE DIGITAL TWIN - CNC MULTI-SPINDLE CELL"}
        </p>
        <div className={`flex items-center gap-2 text-[10px] font-bold ${isCritical ? "text-red-400" : "text-emerald-400"}`}>
          <span className={`status-ping relative flex h-2 w-2 rounded-full ${isCritical ? "bg-red-400" : "bg-emerald-400"}`} /> {isCritical ? "REPLAY" : "LIVE"}
        </div>
      </div>

      <NetworkPing />

      {/* 3D Visual Centerpiece replaced by Global WebGL */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full border border-cyan-400/10 rounded-full blur-3xl opacity-20 scale-150" />
      </div>

      {/* DVR Time Scrubber */}
      <div className="absolute top-12 left-1/2 z-20 -translate-x-1/2 w-full max-w-md bg-black/60 px-4 py-2 border border-command-line/80 backdrop-blur-md rounded-full flex items-center gap-4">
        <Icon name="play" className="h-3 w-3 text-cyan-400/60" />
        <input 
          type="range" 
          min="0" max="100" 
          value={timeline} 
          onChange={(e) => setTimeline(parseInt(e.target.value))}
          className="flex-1 h-1 bg-command-line/50 rounded-full appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 hover:[&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,212,255,0.8)] transition-all"
        />
        <span className="text-[10px] font-mono text-cyan-300">T-{100 - timeline}m</span>
      </div>

      {/* HUD Overlays */}
      <div className="relative z-10 mt-16 grid grid-cols-2 gap-4 xl:grid-cols-4 xl:w-1/2">
        <HUDMetric icon="power" label="Spindle Speed" value={isCritical ? "14,800" : currentSpeed} unit="RPM" critical={isCritical || telemetryData?.speed?.quality !== 'GOOD'} />
        <HUDMetric icon="arrow" label="Feed Rate" value={isCritical ? "1,400" : "1,250"} unit="mm/min" critical={isCritical} />
        <HUDMetric icon="shield" label="Coolant Temp" value={isCritical ? "38.2" : currentTemp} unit="°C" critical={isCritical || telemetryData?.temp?.quality !== 'GOOD'} />
        <HUDMetric icon="chart" label="Power Draw" value={isCritical ? "11.4" : "7.8"} unit="kW" critical={isCritical} />
      </div>

      {/* Twin State Score Card */}
      <div className="absolute bottom-6 right-6 z-20 border border-command-line/80 bg-black/60 p-4 backdrop-blur-xl">
        <p className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${isCritical ? "text-red-400" : "text-cyan-400"}`}>Digital Twin State</p>
        <div className="mt-3 flex items-center gap-4">
          <div className={`grid h-16 w-16 place-items-center rounded-full border-2 ${isCritical ? "border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]" : "border-cyan-400 shadow-[0_0_15px_rgba(0,212,255,0.4)]"}`}>
            <div className="text-center">
              <span className="text-xl font-bold text-white">{isCritical ? "42" : "96"}</span>
              <span className={`text-[8px] ${isCritical ? "text-red-200" : "text-cyan-200"}`}>/100</span>
            </div>
          </div>
          <div className="space-y-1 font-mono text-[10px]">
            <div className="flex justify-between gap-4">
              <span className="text-command-steel">CONFIDENCE</span>
              <span className="text-white">98.7%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-command-steel">LATENCY</span>
              <span className="text-white">18 ms</span>
            </div>
          </div>
        </div>
      </div>
    </LearningTrigger>
  );
}

function HUDMetric({ icon, label, value, unit, critical }: { icon: IconName; label: string; value: string; unit: string; critical?: boolean }) {
  return (
    <motion.div 
      layout
      className={`border ${critical ? "border-red-500/50 bg-red-900/20" : "border-command-line/40 bg-black/40"} p-2 backdrop-blur-md`}
    >
      <div className="flex items-center gap-2">
        <Icon name={icon} className={`h-3 w-3 ${critical ? "text-red-400" : "text-cyan-400/60"}`} />
        <span className="text-[10px] text-command-muted">{label}</span>
      </div>
      <p className={`mt-1 font-mono text-lg font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]`}>
        {value} <span className={`text-[10px] ${critical ? "text-red-300" : "text-cyan-300"}`}>{unit}</span>
      </p>
    </motion.div>
  );
}

function TelemetryBar({ telemetryData }: { telemetryData?: OverviewTelemetry }) {
  const currentTemp = telemetryData?.temp?.value_numeric ? `+${(Number(telemetryData.temp.value_numeric) - 20.0).toFixed(1)} µm` : "+1.8 µm";
  const currentVib = telemetryData?.vib?.value_numeric ? `${Number(telemetryData.vib.value_numeric).toFixed(2)} mm/s` : "1.42 mm/s";

  return (
    <div className="mt-3 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
      <TelemetryBlock title="Machine Condition" value="96/100" sub="Excellent" />
      <TelemetryBlock title="Spindle Thermal Drift" value={currentTemp} sub={telemetryData?.temp?.quality === 'GOOD' ? 'Stable' : 'Warning'} />
      <TelemetryBlock title="Vibration Analysis" value={currentVib} sub={telemetryData?.vib?.quality === 'GOOD' ? 'Normal' : 'High'} />
      <TelemetryBlock title="Tool Wear" value="12%" sub="Good" />
      <TelemetryBlock title="Shaft / Bearing Health" value="94/100" sub="Good" />
      <TelemetryBlock title="Dimensional Quality Hold" value="1.63" sub="Capable" color="emerald" />
    </div>
  );
}

function LiveSparkline({ color }: { color: string }) {
  const [points, setPoints] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPoints(Array.from({ length: 20 }, (_, index) => seededValue(index + 1) * 15));
    const interval = setInterval(() => {
      setPoints(prev => {
        if (prev.length === 0) return Array.from({ length: 20 }, (_, index) => seededValue(index + 1) * 15);
        const nextSeed = prev[prev.length - 1] + prev.length + 1;
        const next = [...prev.slice(1), seededValue(nextSeed) * 15];
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted || points.length === 0) {
    return (
      <svg className="h-6 w-16 opacity-70" viewBox="0 0 100 20" preserveAspectRatio="none">
      </svg>
    );
  }

  const polylineStr = points.map((p, i) => `${i * 5},${18 - p}`).join(" ");

  return (
    <svg className="h-6 w-16 opacity-70" viewBox="0 0 100 20" preserveAspectRatio="none">
      <polyline points={polylineStr} fill="none" stroke={color} strokeWidth="1.5" className="transition-all duration-300 ease-linear" />
    </svg>
  );
}

function TelemetryBlock({ title, value, sub, color = "cyan" }: { title: string; value: string; sub: string; color?: string }) {
  const colorClass = color === "emerald" ? "text-emerald-400" : "text-cyan-400";
  return (
    <div className="relative overflow-hidden border border-command-line/70 bg-black/40 p-3 transition-all hover:bg-black/60">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent opacity-0 transition-opacity hover:opacity-100" />
      <p className="text-[10px] font-semibold text-command-muted">{title}</p>
      <div className="mt-2 flex items-end justify-between">
        <div>
          <p className="font-mono text-lg font-bold text-white">{value}</p>
          <p className={`text-[10px] ${colorClass}`}>{sub}</p>
        </div>
        <LiveSparkline color={color === "emerald" ? "#10b981" : "#00d4ff"} />
      </div>
    </div>
  );
}

function ReplayableScenariosPanel({ latestRun, scenarios }: { latestRun: { id: string, state: string } | null, scenarios?: ScenarioSummary[] }) {
  return (
    <div className="border border-command-line/70 bg-black/30 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-command-muted">Replayable Twin Scenarios</p>
      <div className="mt-4 space-y-2">
        {scenarios && scenarios.length > 0 ? scenarios.map((s, idx) => (
          <ScenarioRow key={s.id} title={`Scenario ${idx + 1} - ${s.name}`} status={idx === 0 ? "ACTIVE" : "QUEUED"} time={idx === 0 ? "2 min ago" : "--"} active={idx === 0} />
        )) : (
          <>
            <ScenarioRow title="Scenario 1 - Roughing" status="COMPLETED" time="2h ago" />
            <ScenarioRow title="Scenario 2 - Thermal Stress" status="COMPLETED" time="4h ago" />
            <ScenarioRow title="Scenario 3 - Finish Turning" status="ACTIVE" time="2 min ago" active />
            <ScenarioRow title="Scenario 4 - Tool Wear Progression" status="QUEUED" time="--" />
          </>
        )}
      </div>
      <button className="mt-4 text-[10px] font-semibold text-cyan-400 hover:text-cyan-300">View all scenarios &gt;</button>
    </div>
  );
}

function ScenarioRow({ title, status, time, active }: { title: string; status: string; time: string; active?: boolean }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setProgress(p => (p + Math.random() * 5) % 100);
    }, 1000);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className={`flex flex-col border-l-2 p-2 ${active ? "border-amber-400 bg-amber-400/[0.05]" : "border-command-line/40 bg-black/20"}`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold ${active ? "text-amber-300" : "text-slate-300"}`}>{title}</span>
        <div className="flex items-center gap-3">
          <span className={`text-[9px] font-bold ${status === "COMPLETED" ? "text-emerald-400" : status === "ACTIVE" ? "text-amber-400" : "text-command-steel"}`}>{status}</span>
          <span className="w-12 text-right text-[10px] text-command-muted">{time}</span>
        </div>
      </div>
      {active && (
        <div className="mt-2 h-1 w-full bg-black border border-amber-400/20 overflow-hidden">
          <motion.div className="h-full bg-amber-400" initial={{ width: "0%" }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: "linear" }} />
        </div>
      )}
    </div>
  );
}

function ProductionTraceabilityPanel({ latestRun }: { latestRun: { state: string } | null }) {
  return (
    <div className="border border-command-line/70 bg-black/30 p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-command-muted">Production Traceability</p>
        <StatusChip status={latestRun?.state === "APPROVAL_REQUIRED" ? "approval" : "simulated"} compact />
      </div>
      <p className="mt-3 text-sm font-bold text-white">Lot NT-2025-0517-AX12</p>
      <div className="mt-3 space-y-3 border-l border-command-line/60 ml-2 pl-3 relative">
        <TraceStep label="Raw Material" value="SUS440C - Heat 9A7721" done />
        <TraceStep label="Operation" value="Finish Turning - CNC Cell 2" done />
        <TraceStep label="Inspection" value="In-Process Dimensional" active />
        <TraceStep label="Final Disposition" value="Pending" />
      </div>
    </div>
  );
}

function TraceStep({ label, value, done, active }: { label: string; value: string; done?: boolean; active?: boolean }) {
  return (
    <div className="relative">
      <span className={`absolute -left-[17px] top-1 h-2 w-2 rounded-full border ${done ? "bg-cyan-400 border-cyan-400" : active ? "bg-amber-400 border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" : "bg-black border-command-line"}`} />
      <p className="text-[10px] text-command-muted">{label}</p>
      <p className={`text-xs ${active ? "text-amber-300 font-semibold" : "text-white"}`}>{value}</p>
    </div>
  );
}

function LiveEventLedgerPanel() {
  const [logs, setLogs] = useState<{ id: number, label: string, hash: string, time: string }[]>([]);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const labels = ["Telemetry Ingest", "Anomaly Scan", "State Replay", "Hash Verification", "Spindle Drift Comp", "Vibration FFT", "Twin Mesh Update", "Operator Gate Check"];
    const interval = setInterval(() => {
      setCounter(c => c + 1);
      setLogs(prev => {
        const newLog = {
          id: Date.now(),
          label: labels[Math.floor(Math.random() * labels.length)],
          hash: Math.random().toString(16).slice(2, 10),
          time: new Date().toISOString().split('T')[1].slice(0, 8)
        };
        return [newLog, ...prev].slice(0, 5);
      });
    }, 1200 + Math.random() * 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <LearningTrigger topic="blockchain_fit" className="border border-command-line/70 bg-black/30 p-4 overflow-hidden h-[240px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-command-muted">Live Event Ledger</p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-cyan-400">{counter} events</span>
          <span className="relative flex h-2 w-2 rounded-full bg-emerald-400 status-ping shrink-0" />
        </div>
      </div>
      <div className="space-y-2 relative flex-1">
        <AnimatePresence>
          {logs.map((log) => (
            <motion.div 
              key={log.id} 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-[1fr_80px_30px] items-center gap-2 border-b border-command-line/40 py-1"
            >
              <div className="min-w-0">
                <p className="text-xs text-white truncate">{log.label}</p>
                <p className="text-[9px] text-command-muted">{log.time}</p>
              </div>
              <div>
                <p className="text-[9px] text-command-muted">HASH</p>
                <p className="font-mono text-[10px] text-cyan-300">{log.hash}</p>
              </div>
              <Icon name="check" className="h-4 w-4 text-emerald-400 justify-self-end shrink-0" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </LearningTrigger>
  );
}

function OverviewRail({ latestRun }: { latestRun: { id: string, state: string } | null }) {
  return (
    <div className="glass-panel relative flex h-full flex-col overflow-hidden bg-black/40">
      {/* Right accent bar */}
      <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-cyan-400/25 to-transparent" />

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        
        {/* IDE ADVERTISEMENT */}
        <section className="relative overflow-hidden border border-fuchsia-500/50 bg-fuchsia-950/30 p-4">
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-fuchsia-400 animate-ping absolute opacity-75" />
              <span className="h-2 w-2 rounded-full bg-fuchsia-500 relative" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-fuchsia-400">New Feature</p>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Smart Contract Policy Editor</h3>
            <p className="text-[10px] text-fuchsia-200/80 mb-3 leading-relaxed">
              Write, compile, and deploy governance contracts natively from the browser. Now supporting XRPL EVM Sidechain & Hedera Testnet!
            </p>
            <Link href="/ide" className="inline-flex w-full justify-center border border-fuchsia-500/50 bg-fuchsia-500/20 py-2 text-[10px] font-bold uppercase tracking-widest text-fuchsia-300 transition-colors hover:bg-fuchsia-500/40">
              Launch IDE
            </Link>
          </div>
        </section>

        {/* Knowledge Retrieval */}
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-command-muted">Command Intelligence</p>
          <h3 className="mt-1.5 text-sm font-semibold text-white">Maintenance Knowledge</h3>
          <p className="mt-1 text-[10px] text-slate-400">Retrieve proven solutions from operational knowledge base.</p>
          <div className="mt-3 border border-command-line/70 bg-black/40 p-3">
            <p className="text-[9px] uppercase text-cyan-400">Top Recommendation</p>
            <p className="mt-1 text-xs font-semibold text-white">Spindle thermal drift compensation</p>
            <div className="mt-2 flex justify-between text-[10px]">
              <div>
                <span className="text-command-muted">Success rate:</span> <span className="text-emerald-400 font-bold">94%</span>
              </div>
              <div>
                <span className="text-command-muted">Used in:</span> <span className="text-cyan-300 font-bold">128 runs</span>
              </div>
            </div>
          </div>
        </section>

        {/* Operator Actions */}
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Operator Actions</h3>
            <StatusChip status="approval" compact />
          </div>
          <div className="mt-3 space-y-2">
            <div className="border border-amber-400/30 bg-amber-400/[0.05] p-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-200">Thermal offset update</p>
                <p className="text-[10px] text-command-muted">Adjust spindle comp. +2.3 µm</p>
              </div>
              <button className="border border-amber-400/50 bg-amber-400/10 px-2 py-1 text-[10px] text-amber-400">REVIEW</button>
            </div>
          </div>
        </section>

        {/* KPI dashboard */}
        <section>
          <h3 className="text-sm font-semibold text-white">KPIs - This Shift</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <KPIBlock label="OEE" value="89.6%" delta="+0.2%" />
            <KPIBlock label="First Pass Yield" value="98.7%" delta="+2.1%" />
            <KPIBlock label="Scrap Rate" value="0.32%" delta="-0.18%" />
            <KPIBlock label="On-Time Delivery" value="99.1%" delta="+1.7%" />
          </div>
        </section>

        {/* System Alerts */}
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">System Alerts</h3>
            <span className="text-[10px] text-cyan-400 cursor-pointer">View all</span>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex gap-2">
              <Icon name="shield" className="h-4 w-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-300">Thermal drift trending up</p>
                <p className="text-[9px] text-command-muted">Spindle 2 - Monitor</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Icon name="power" className="h-4 w-4 text-red-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-300">Vibration anomaly detected</p>
                <p className="text-[9px] text-command-muted">Bearing B2 - Review</p>
              </div>
            </div>
          </div>
        </section>

        {/* Next Maintenance */}
        <section className="border border-cyan-400/30 bg-cyan-400/[0.05] p-4">
          <p className="text-[10px] font-semibold uppercase text-command-muted">Next Maintenance Window</p>
          <div className="mt-2 flex items-center gap-3">
            <Icon name="roadmap" className="h-6 w-6 text-cyan-400" />
            <div>
              <p className="text-lg font-bold text-white">In 2d 18h</p>
              <p className="text-[10px] text-cyan-200">MAY 20, 02:00</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function KPIBlock({ label, value, delta }: { label: string; value: string; delta: string }) {
  const isPositive = delta.startsWith("+") || delta.startsWith("-0");
  return (
    <div className="border border-command-line/50 bg-black/40 p-2">
      <p className="text-[10px] text-command-muted">{label}</p>
      <p className="mt-1 text-lg font-bold text-white">{value}</p>
      <p className={`text-[9px] ${isPositive ? "text-emerald-400" : "text-amber-400"}`}>{delta}</p>
    </div>
  );
}
